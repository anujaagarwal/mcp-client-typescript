import { NextRequest, NextResponse } from 'next/server';
import { MCPClient } from '../../../lib/mcpClient.js';
import path from 'path';

// Create a singleton instance of MCPClient
let mcpClient: MCPClient | null = null;

// Initialize the MCP client
const initializeMCPClient = () => {
    if (!mcpClient) {
        mcpClient = new MCPClient();
    }
    return mcpClient;
};

export async function POST(request: NextRequest) {
    try {
        const { action, query, toolName, toolArgs, access_token, refresh_token } = await request.json();

        // Initialize the MCP client if not already initialized
        const client = initializeMCPClient();

        switch (action) {
            case 'connect': {
                const projectRoot = process.cwd();
                const tools = await client.connectToGoogleWorkspaceMCP("user-session-1", {
                    clientId: process.env.GOOGLE_CLIENT_ID || "",
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
                    configPath: path.join(projectRoot, '.mcp', 'google-workspace-mcp/config'),
                    workspacePath: path.join(projectRoot, '.mcp', 'google-workspace-mcp/src'),
                    accessToken: access_token,
                    refreshToken: refresh_token
                });
                return NextResponse.json({ tools });
            }

            case 'query': {
                if (!query) {
                    return NextResponse.json({ error: "Query is required" }, { status: 400 });
                }
                const response = await client.processQuery(query, "user-session-1");
                return NextResponse.json({ response });
            }

            case 'invokeTool': {
                if (!toolName) {
                    return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
                }
                const toolArgsWithToken = {
                    ...toolArgs,
                    accessToken: access_token
                };
                const result = await client.invokeTool("user-session-1", toolName, toolArgsWithToken || {});
                return NextResponse.json({ result });
            }

            case 'getTools': {
                const tools = client.getAvailableTools();
                return NextResponse.json({ tools });
            }

            default:
                return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }
    } catch (error: any) {
        console.error("Error in MCP API:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}

// Cleanup on server shutdown
process.on('SIGINT', async () => {
    if (mcpClient) {
        console.log('Cleaning up MCP client...');
        await mcpClient.cleanup();
    }
}); 