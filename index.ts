
// import { MessageParam, Tool } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
// // import { Client } from "@modelcontextprotocol/sdk/client/index.js";
// // import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
// import readline from 'readline/promises';
// // import dotenv from "dotenv";
// import { createGoogleGenerativeAI } from '@ai-sdk/google';
// import { mcpServerDatabase } from "./data.js"; // Assuming this contains server information
// import { google } from 'googleapis';
// // import path from 'path';
// // import { execSync } from 'child_process';
// import { spawn } from 'child_process';
// dotenv.config();

// // Set max duration for LLM streaming responses
// export const maxDuration = 60;
// import { GoogleGenAI } from "@google/genai";
// const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
// if (!GOOGLE_GENERATIVE_AI_API_KEY) {
//   throw new Error("Google Api Key is not set");
// }


// const ai = new GoogleGenAI({ apiKey: GOOGLE_GENERATIVE_AI_API_KEY});
// console.log(GOOGLE_GENERATIVE_AI_API_KEY);
// spawn('/usr/local/bin/docker', ['ps']);
// const child = spawn('docker', ['ps'], {
//   env: {
//     ...process.env,  
//     CUSTOM_VAR: 'value'
//   }
// });




// child.on('error', (err) => {
//   console.error('Failed to start subprocess:', err);
// });

// class MCPClient {
//   private mcp: Client;
//   private google: any;
//   private transport: StdioClientTransport | null = null;
//   private tools: Tool[] = [];
//   private sessions: { [key: string]: Client } = {}; // Store multiple sessions by server name

//   constructor() {
//     this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
//     this.google = ai;
//   }


//   // Get a list of compatible servers based on user prompt
//   public async getMCPServersList(req: { prompt: string }) {
//     const serversList = mcpServerDatabase;
//     const { prompt } = req;

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash-exp",
//       contents: `Here are the MCP server details: ${JSON.stringify(serversList)} and here is the user prompt: ${prompt}. Please provide me with a list of compatible servers in the form of JSON format which will solve the user query. Check tags to figure out which will be the most compatible server and return max 2 mcp servers.`,
         
   
    
//     });

//     console.log("List of Available Servers:", response);
//     return response.text;
//   }

//   // Connect to a specified server script (JS/Python)
//   async connectToGoogleWorkspaceMCP(sessionId: string, config: {
//     clientId: string,
//     clientSecret: string,
//     configPath: string,
//     workspacePath: string
// }) {
//     try {
//         const dockerPath = process.platform === 'win32'
//             ? 'C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe'  // Windows path (adjust as needed)
//             : '/usr/local/bin/docker';
//         let useDocker = true;

//         // Check if Docker is installed
//         try {
//             // Use a simple synchronous check to see if Docker is available
//             execSync('docker --version', { stdio: 'ignore' });
//         } catch (error) {
//             console.warn("Docker is not installed or not available in PATH. Falling back to local execution.");
//             useDocker = false;
//         }

//         if (useDocker) {
//             // Use Docker if available
//             this.transport = new StdioClientTransport({
//                 command: dockerPath,
//                 args: [
//                     "run",
//                     "--rm",
//                     "-i",
//                     "-v", `${config.configPath}:/app/config`,
//                     "-v", `${config.workspacePath}:/app/workspace`,
//                     "-e", "GOOGLE_CLIENT_ID=" + config.clientId,  // Correctly pass environment variables
//                     "-e", "GOOGLE_CLIENT_SECRET=" + config.clientSecret,
//                     "-e", "LOG_MODE=strict",
//                     "ghcr.io/aaronsb/google-workspace-mcp:latest"
//                 ],
//                 env: {
//                     "GOOGLE_CLIENT_ID": config.clientId,  // Provide env vars here too
//                     "GOOGLE_CLIENT_SECRET": config.clientSecret
//                 }
//             });
//         } else {
//             // Fallback to local execution if Docker is not available
//             // Check if we have Node.js or Python available
//             let command = "";
//             let args: string[] = [];

//             try {
//                 // Try to find a local script to run
//                 const localScriptPath = path.join(config.workspacePath, "index.js");
//                 // Check if the file exists
//                 execSync(`ls ${localScriptPath}`, { stdio: 'ignore' });
//                 command = process.execPath; // Node.js executable
//                 args = [localScriptPath];
//             } catch (error) {
//                 try {
//                     // Try Python script as fallback
//                     const pythonScriptPath = path.join(config.workspacePath, "main.py");
//                     execSync(`ls ${pythonScriptPath}`, { stdio: 'ignore' });
//                     command = process.platform === "win32" ? "python" : "python3";
//                     args = [pythonScriptPath];
//                 } catch (error) {
//                     throw new Error("Could not find a suitable local script to execute. Please install Docker or provide a valid script.");
//                 }
//             }

//             this.transport = new StdioClientTransport({
//                 command,
//                 args,
//                 env: {
//                     "GOOGLE_CLIENT_ID": config.clientId,
//                     "GOOGLE_CLIENT_SECRET": config.clientSecret
//                 }
//             });
//         }

//         this.mcp.connect(this.transport);
//         this.sessions[sessionId] = this.mcp;

//         const toolsResult = await this.mcp.listTools();
//         this.tools = toolsResult.tools.map((tool) => ({
//             name: tool.name,
//             description: tool.description,
//             input_schema: tool.inputSchema,
//         }));

//         console.log("Connected to Google Workspace MCP with tools:", this.tools.map(({ name }) => name));
//         return this.tools;
//     } catch (e) {
//         console.log("Failed to connect to Google Workspace MCP server: ", e);
//         throw e;
//     }
// }


//   async processQuery(query: string, sessionId: string) {
//     try {
//       // Format the message correctly for Gemini API
//       const contents = [{
//         role: "user",
//         parts: [{
//           text: query
//         }]
//       }];
      
//       // Format tools correctly for Gemini API
//       const googleTools = this.tools.length > 0 ? {
//         tools: [{
//           functionDeclarations: this.tools.map(tool => ({
//             name: tool.name,
//             description: tool.description,
//             parameters: tool.input_schema
//           }))
//         }]
//       } : {};
      
//       console.log("Sending request with tools:", JSON.stringify(googleTools, null, 2));
      
//       // Make the API call
//       const response = await ai.models.generateContent({
//         model: "gemini-2.0-flash-exp",
//         contents: contents,
//         config: {
//           temperature: 0.2,  // Lower temperature to encourage tool use
//           maxOutputTokens: 1024
//         },
//         ...googleTools
//       });
      
//       console.log("Response structure:", JSON.stringify(response, null, 2));
      
//       const finalText = [];
//       const toolResults = [];
  
//       // Correct way to check for function calls in Gemini API response
//       const functionCalls = response.candidates?.[0]?.content?.parts?.[0]?.functionCall || 
//                            response.candidates?.[0]?.content?.parts?.filter(part => part.functionCall);
      
//       console.log("Function calls detected:", functionCalls);
      
//       if (functionCalls && (Array.isArray(functionCalls) ? functionCalls.length > 0 : true)) {
//         // Handle single function call object
//         if (!Array.isArray(functionCalls)) {
//           const functionCall = functionCalls;
//           const toolName = functionCall.name;
//           const toolArgs = functionCall.args;
          
//           // Check if toolName is defined and is a string
//           if (typeof toolName !== 'string') {
//             finalText.push(`[Error: Tool name is undefined or not a string]`);
//             return finalText.join("\n"); // Exit the function early
//           }
          
//           finalText.push(`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`);
          
//           try {
//             const result = await this.sessions[sessionId].callTool({
//               name: toolName, // Now we're sure toolName is a string
//               arguments: toolArgs,
//             });
            
//             toolResults.push(result);
            
//             // Add tool result to conversation for follow-up
//             const followUpContents = [
//               ...contents,
//               {
//                 role: "model",
//                 parts: [{
//                   functionCall: {
//                     name: toolName,
//                     args: toolArgs
//                   }
//                 }]
//               },
//               {
//                 role: "function",
//                 parts: [{
//                   functionResponse: {
//                     name: toolName,
//                     response: {
//                       content: result.content
//                     }
//                   }
//                 }]
//               }
//             ];
            
//             // Get follow-up response
//             const nextResponse = await ai.models.generateContent({
//               model: "gemini-2.0-flash-exp",
//               contents: followUpContents,
//               ...googleTools
//             });
            
//             finalText.push(nextResponse.text || "No response text");
//           } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//             finalText.push(`[Error calling tool ${toolName}: ${errorMessage}]`);
//           }
//         } 
//         // Handle array of function calls
//         else {
//           for (const part of functionCalls) {
//             const functionCall = part.functionCall;
//             if (!functionCall) {
//               continue; // Skip if no function call
//             }
            
//             const toolName = functionCall.name;
//             const toolArgs = functionCall.args;
            
//             // Check if toolName is defined and is a string
//             if (typeof toolName !== 'string') {
//               finalText.push(`[Error: Tool name is undefined or not a string]`);
//               continue; // Skip this iteration since we're in a loop
//             }
            
//             finalText.push(`[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`);
            
//             try {
//               const result = await this.sessions[sessionId].callTool({
//                 name: toolName, // Now we're sure toolName is a string
//                 arguments: toolArgs,
//               });
              
//               toolResults.push(result);
              
//               // Add tool result to conversation for follow-up
//               const followUpContents = [
//                 ...contents,
//                 {
//                   role: "model",
//                   parts: [{
//                     functionCall: {
//                       name: toolName,
//                       args: toolArgs
//                     }
//                   }]
//                 },
//                 {
//                   role: "function",
//                   parts: [{
//                     functionResponse: {
//                       name: toolName,
//                       response: {
//                         content: result.content
//                       }
//                     }
//                   }]
//                 }
//               ];
              
//               // Get follow-up response
//               const nextResponse = await ai.models.generateContent({
//                 model: "gemini-2.0-flash-exp",
//                 contents: followUpContents,
//                 ...googleTools
//               });
              
//               finalText.push(nextResponse.text || "No response text");
//             } catch (error) {
//               const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//               finalText.push(`[Error calling tool ${toolName}: ${errorMessage}]`);
//             }
//           }
//         }
//       } else {
//         // No function calls detected
//         finalText.push(response.text || "No response received");
//       }
      
//       return finalText.join("\n");
//     } catch (error) {
//       console.error("Error in processQuery:", error);
//       throw error;
//     }
//   }
  

//   // Main loop for user interaction via console
//   async chatLoop() {
//     const rl = readline.createInterface({
//       input: process.stdin,
//       output: process.stdout,
//     });
  
//     try {
//       console.log("\nMCP Client Started!");
//       console.log("Type your queries or 'quit' to exit.");
  
//       while (true) {
//         const message = await rl.question("\nQuery: ");
//         if (message.toLowerCase() === "quit") {
//           break;
//         }
//         try {
//           const response = await this.processQuery(message, "user-session-1");
//           console.log("\n" + response);
//         } catch (error) {
//           console.error("Error processing query:", error);
//           console.log("Please try again or type 'quit' to exit.");
//         }
//       }
//     } finally {
//       rl.close();
//     }
//   }
  

//   // Cleanup and close sessions
//   async cleanup() {
//     await this.mcp.close();
//   }
//   async invokeTool(toolName: string, args: any) {
//        return await this.mcp.callTool({
//          name: toolName,
//          arguments: args,
//        });
//     }
// }

// async function main() {
  
//   const projectRoot = process.cwd(); 
//   console.log('PATH:', process.env.PATH);
//   const mcpClient = new MCPClient();
//   try {
//     const req = { prompt: "connect me to a perfect mcp for projects" };

//     // Example: Connect to selected servers based on user choice
//     await mcpClient.getMCPServersList(req);
//    // Correct syntax for calling connectToGoogleWorkspaceMCP
//     await mcpClient.connectToGoogleWorkspaceMCP("user-session-1",  {
//       clientId: process.env.GOOGLE_CLIENT_ID || "", 
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET || "", 
//       configPath: path.join(projectRoot, '.mcp', 'google-workspace-mcp/config'), 
//       workspacePath: path.join(projectRoot, '.mcp', 'google-workspace-mcp/src')
//     });

//     try {
//       const authResult = await mcpClient.invokeTool('authenticate_workspace_account', {
//         email: "anujaagarwal08@gmail.com",
//         account_type: "personal"  // or "work" if it's a work account
//       });
      
//       console.log("Authentication result:", authResult);
      
//       // The MCP server will handle the OAuth flow and store the tokens
//       // It will provide instructions in the console for manual authorization
//     } catch (error) {
//       console.error("Authentication failed:", error);
//     }

//     await mcpClient.chatLoop();
//   } finally {
//     await mcpClient.cleanup();
//     process.exit(0);
//   }
// }

// main();


// 



import express, { Request, Response } from 'express';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import path from 'path';
import { execSync } from 'child_process';
// import { mcpServerDatabase } from "./data.js"; // Assuming this contains server information - not required
dotenv.config();

const GOOGLE_GENERATIVE_AI_API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error("Google Api Key is not set");
}

const ai = new GoogleGenAI({ apiKey: GOOGLE_GENERATIVE_AI_API_KEY });
interface SessionData {
  client: Client<any, any, any>;
  accessToken?: string;
  refreshToken?: string;
}

export class MCPClient {
    private mcp: Client<any, any, any>;
    private transport: StdioClientTransport | null = null;
    private tools: any[] = [];
    private sessions: { [key: string]: SessionData } = {};

    constructor() {
        this.mcp = new Client({ name: "mcp-client-express", version: "1.0.0" });
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

            }
            ;

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

    async callTool({ name, arguments: args, sessionId }: { name: string, arguments: any, sessionId: string }) {
        if (!this.sessions[sessionId]) {
            throw new Error(`Session ${sessionId} not found. Please connect first.`);
        }
        
        try {
            const result = await this.sessions[sessionId].client.callTool({
                name,
                arguments: args
            });
            
            return result;
        } catch (error) {
            console.error(`Error calling tool ${name}:`, error);
            throw error;
        }
    }

    async processQuery(query: string, sessionId: string) {
        try {
            const contents = [{
                role: "user",
                parts: [{ text: query }]
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

            const response = await ai.models.generateContent({
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
                        const { doAuthentication } = await import('./src/tools/doAuthentication.js');
                        
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
                                    const { doAuthentication } = await import('./src/tools/doAuthentication.js');
                                    
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
                    
                    return `[Tool ${toolName} result]: ${result.content}`;
                } catch (error) {
                    return `[Error calling tool ${toolName}]: ${error}`;
                }
            } else {
                return response.text || "No response received";
            }
        } catch (error) {
            console.error("Error in processQuery:", error);
            throw error;
        }
    }

    async invokeTool(sessionId: string, toolName: string, args: any) {
        const session = this.sessions[sessionId];
        if (!this.sessions[sessionId]) throw new Error("Session not found");
        
        // Handle doAuthentication tool locally
        if (toolName === 'doAuthentication') {
            // Import the doAuthentication function dynamically
            const { doAuthentication } = await import('./src/tools/doAuthentication.js');
            
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
        
        const result = await this.sessions[sessionId].client.callTool({ 
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
                    const { doAuthentication } = await import('./src/tools/doAuthentication.js');
                    
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
}

const app = express();
app.use(express.json());
export default app;
const port = 4100;

const mcpClient = new MCPClient();

const handleCodeRequest = async (req: Request, res: Response) : Promise<void> => {
    try {
        const { action, query, toolName, toolArgs, access_token, refresh_token } = req.body;

        switch (action) {
            case 'connect': {
                const projectRoot = process.cwd();
                const tools = await mcpClient.connectToGoogleWorkspaceMCP("user-session-1", {
                    clientId: process.env.GOOGLE_CLIENT_ID || "",
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
                    configPath: path.join(projectRoot, '.mcp', 'google-workspace-mcp/config'),
                    workspacePath: path.join(projectRoot, '.mcp', 'google-workspace-mcp/src'),
                    accessToken: access_token, 
                    refreshToken: refresh_token  
                            // <-- add refresh token here
                });
                res.json({ tools });
                return;
            }
            case 'query': {
                if (!query) res.status(400).json({ error: "Query is required" });
                const response = await mcpClient.processQuery(query, "user-session-1");
                res.json({ response });
                return;
            }
            case 'invokeTool': {
                if (!toolName) res.status(400).json({ error: "Tool name is required" });
                const toolArgsWithToken = {
                  ...toolArgs,
                  accessToken: access_token // inject from req.body or your session store
              };
                const result = await mcpClient.invokeTool("user-session-1", toolName, toolArgsWithToken || {});
                res.json({ result });
                return;
            }
            default:
                res.status(400).json({ error: "Invalid action" });
                return;
        }
    
      } catch (error: any) {
        console.error("Error in /code:", error);
      
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
};

app.post('/code', handleCodeRequest);

app.get('/code', (req: Request, res: Response) => {
  const { code, error } = req.query;
  if (error) {
    res.status(400).send(`OAuth error: ${error}`);
  }
  if (!code) {
    res.status(400).send('No code received');
  }
  // You can display the code, or (recommended) immediately exchange it for tokens
  res.send(`Authorization code: ${code}`);
});


// Cleanup on server shutdown
process.on('SIGINT', async () => {
    console.log('Cleaning up...');
    await mcpClient.cleanup();
    process.exit();
});

app.listen(port, () => {
    console.log(`MCP Express server listening on http://localhost:${port}`);
});
