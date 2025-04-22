import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenAI } from "@google/genai";
import path from 'path';
import { execSync } from 'child_process';

// Define types
interface SessionData {
    client: Client<any, any, any>;
    accessToken?: string;
    refreshToken?: string;
}

interface Tool {
    name: string;
    description?: string;
    input_schema: any;
}

export class MCPClient {
    private mcp: Client<any, any, any>;
    private transport: StdioClientTransport | null = null;
    private tools: Tool[] = [];
    private sessions: { [key: string]: SessionData } = {};
    private ai: GoogleGenAI;

    constructor() {
        this.mcp = new Client({ name: "mcp-client-nextjs", version: "1.0.0" });
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            throw new Error("Google API Key is not set");
        }
        this.ai = new GoogleGenAI({ apiKey });
    }

    async connectToGoogleWorkspaceMCP(sessionId: string, config: {
        clientId: string,
        clientSecret: string,
        configPath: string,
        workspacePath: string,
        accessToken?: string,
        refreshToken?: string
    }) {
        try {
            const dockerPath = process.platform === 'win32'
                ? 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe'
                : '/usr/local/bin/docker';
            let useDocker = true;

            try {
                execSync('docker --version', { stdio: 'ignore' });
            } catch (error) {
                console.warn("Docker is not installed or not available in PATH. Falling back to local execution.");
                useDocker = false;
            }

            if (useDocker) {
                this.transport = new StdioClientTransport({
                    command: dockerPath,
                    args: [
                        "run",
                        "--rm",
                        "-i",
                        "-v", `${config.configPath}:/app/config`,
                        "-v", `${config.workspacePath}:/app/workspace`,
                        "-e", `GOOGLE_CLIENT_ID=${config.clientId}`,
                        "-e", `GOOGLE_CLIENT_SECRET=${config.clientSecret}`,
                        "-e", "LOG_MODE=strict",
                        "ghcr.io/aaronsb/google-workspace-mcp:latest"
                    ],
                    env: {
                        "GOOGLE_CLIENT_ID": config.clientId,
                        "GOOGLE_CLIENT_SECRET": config.clientSecret
                    }
                });
            } else {
                throw new Error("Docker not found. Local fallback not implemented.");
            }

            this.mcp.connect(this.transport);
            this.sessions[sessionId] = {
                client: this.mcp,
                accessToken: config.accessToken,
                refreshToken: config.refreshToken
            };

            const toolsResult = await this.mcp.listTools();
            this.tools = toolsResult.tools.map((tool) => ({
                name: tool.name,
                description: tool.description,
                input_schema: tool.inputSchema,
            }));

            // Add our local doAuthentication tool
            this.tools.push({
                name: "doAuthentication",
                description: "Authenticate with Google Workspace using OAuth flow",
                input_schema: {
                    type: "object",
                    properties: {
                        email: {
                            type: "string",
                            description: "Email address to authenticate"
                        },
                        category: {
                            type: "string",
                            description: "Optional account category (e.g., work, personal)"
                        },
                        description: {
                            type: "string",
                            description: "Optional account description"
                        },
                        auth_url: {
                            type: "string",
                            description: "Optional authorization URL if already provided"
                        },
                        sessionId: {
                            type: "string",
                            description: "Session ID for the MCP connection"
                        }
                    },
                    required: ["email", "sessionId"]
                }
            });

            return this.tools;
        } catch (e) {
            throw new Error("Failed to connect to Google Workspace MCP server: " + e);
        }
    }

    async processQuery(query: string, sessionId: string) {
        try {
            // Create a few-shot prompt with examples of tool usage
            const fewShotPrompt = `
You are an AI assistant that helps users interact with Google Workspace tools.
You have access to the following tools:

${this.tools.map(tool => `- ${tool.name}: ${tool.description}`).join('\n')}

When a user asks for something that requires using a tool, you should:
1. Determine which tool is most appropriate
2. Extract the necessary parameters from the user's request
3. Return a structured response with the tool name and arguments

Here are some examples:

User: Create a new Google Doc titled "Project Plan"
Assistant: I'll help you create a new Google Doc.
[Tool createDocument result]: Document created successfully with ID: 1a2b3c4d

User: List my recent Google Drive files
Assistant: I'll retrieve your recent Google Drive files.
[Tool listFiles result]: Found 5 files in your Drive.

User: Send an email to anujagrazzel@gmail.com about the meeting tomorrow
Assistant: I'll help you send an email.
[Tool result]: Email sent successfully to anujagrazzel@gmail.com

Now, please help with the following request:

User: ${query}
`;

            const contents = [{
                role: "user",
                parts: [{ text: fewShotPrompt }]
            }];

            const googleTools = this.tools.length > 0 ? {
                tools: [{
                    functionDeclarations: this.tools.map(tool => ({
                        name: tool.name,
                        description: tool.description,
                        parameters: tool.input_schema
                    }))
                }]
            } : {};

            const response = await this.ai.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents,
                config: { temperature: 0.2, maxOutputTokens: 1024 },
                ...googleTools
            });

            const functionCall = response.candidates?.[0]?.content?.parts?.[0]?.functionCall;

            if (functionCall) {
                const toolName = functionCall.name;
                const toolArgs = functionCall.args;

                try {
                    let result;

                    // Handle doAuthentication tool locally
                    if (toolName === 'doAuthentication') {
                        // Import the doAuthentication function dynamically
                        const { doAuthentication } = await import('../tools/doAuthentication.js');

                        // Check if email is provided in toolArgs
                        if (!toolArgs || !toolArgs.email) {
                            throw new Error("Email is required for authentication");
                        }

                        // Add sessionId to the arguments and ensure email is a string
                        const authArgs = {
                            ...toolArgs,
                            email: typeof toolArgs.email === 'string' ? toolArgs.email : String(toolArgs.email),
                            sessionId
                        };

                        // Call the doAuthentication function
                        result = await doAuthentication(authArgs);
                    } else {
                        // Call the MCP server for other tools
                        result = await this.sessions[sessionId].client.callTool({
                            name: toolName || "",
                            arguments: toolArgs,
                        });

                        // Check if the result indicates authentication is required
                        if (result.content && typeof result.content === 'string') {
                            try {
                                const parsedContent = JSON.parse(result.content);
                                if (parsedContent.status === 'auth_required' &&
                                    parsedContent.methodName === 'completeAuthentication') {
                                    // Import the doAuthentication function dynamically
                                    const { doAuthentication } = await import('../tools/doAuthentication.js');

                                    // Call doAuthentication with the auth URL
                                    // Make sure toolArgs exists and has the email parameter which is required
                                    if (!toolArgs || !toolArgs.email) {
                                        throw new Error("Email is required for authentication");
                                    }

                                    const authResult = await doAuthentication({
                                        email: typeof toolArgs.email === 'string' ? toolArgs.email : String(toolArgs.email),
                                        auth_url: parsedContent.auth_url,
                                        sessionId
                                    });

                                    // Replace the result with the authentication result
                                    result = authResult;
                                }
                            } catch (e) {
                                // Not JSON or doesn't have the expected structure, continue normally
                            }
                        }
                    }

                    // Check if we need to ask the user for more information
                    const requiresUserInput = this.checkIfRequiresUserInput(result.content as string);

                    return {
                        toolName,
                        toolArgs,
                        result: result.content,
                        requiresUserInput
                    };
                } catch (error) {
                    return {
                        toolName,
                        toolArgs,
                        error: (error as Error).message,
                        requiresUserInput: false
                    };
                }
            } else {
                // No function call detected, return the text response
                return {
                    response: response.text || "No response received",
                    requiresUserInput: false
                };
            }
        } catch (error) {
            console.error("Error in processQuery:", error);
            throw error;
        }
    }

    // Helper method to check if the result requires user input
    private checkIfRequiresUserInput(content: string): boolean {
        try {
            const parsed = JSON.parse(content);
            return parsed.requiresUserInput === true ||
                parsed.status === 'auth_required' ||
                parsed.status === 'input_required';
        } catch (e) {
            return false;
        }
    }

    async invokeTool(sessionId: string, toolName: string, args: any) {
        const session = this.sessions[sessionId];
        if (!session) throw new Error("Session not found");

        // Handle doAuthentication tool locally
        if (toolName === 'doAuthentication') {
            // Import the doAuthentication function dynamically
            const { doAuthentication } = await import('../tools/doAuthentication.js');

            // Check if email is provided in args
            if (!args || !args.email) {
                throw new Error("Email is required for authentication");
            }

            // Add sessionId to the arguments
            const authArgs = {
                ...args,
                sessionId
            };

            // Call the doAuthentication function
            return await doAuthentication(authArgs);
        }

        const toolArgsWithToken = {
            ...args,
            accessToken: session.accessToken
        };

        const result = await session.client.callTool({
            name: toolName,
            arguments: toolArgsWithToken
        });

        // Check if the result indicates authentication is required
        if (result.content && typeof result.content === 'string') {
            try {
                const parsedContent = JSON.parse(result.content);
                if (parsedContent.status === 'auth_required' &&
                    parsedContent.methodName === 'completeAuthentication') {
                    // Import the doAuthentication function dynamically
                    const { doAuthentication } = await import('../tools/doAuthentication.js');

                    // Call doAuthentication with the auth URL
                    // Make sure we have the email parameter which is required
                    if (!args.email) {
                        throw new Error("Email is required for authentication");
                    }

                    return await doAuthentication({
                        email: args.email,
                        auth_url: parsedContent.auth_url,
                        sessionId
                    });
                }
            } catch (e) {
                // Not JSON or doesn't have the expected structure, continue normally
            }
        }

        return result;
    }

    async cleanup() {
        for (const sessionId in this.sessions) {
            if (this.sessions.hasOwnProperty(sessionId)) {
                try {
                    await this.sessions[sessionId].client.close();
                } catch (error) {
                    console.error(`Error closing session ${sessionId}:`, error);
                }
            }
        }
        this.sessions = {};
    }

    // Get available tools
    getAvailableTools() {
        return this.tools;
    }
} 