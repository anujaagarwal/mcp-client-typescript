
import readline from 'readline/promises';
import { MCPClient } from '../../index.js';
import open from 'open';

/**
 * Tool to handle Google OAuth authentication flow
 * This tool is used to authenticate with Google Workspace MCP
 * It opens the browser for the user to authenticate and then
 * captures the authorization code to complete the flow
 */
export async function doAuthentication(args: {
  email: string;
  category?: string;
  description?: string;
  auth_url?: string;
  sessionId: string;
}) {
  try {
    const { email, category, description, auth_url, sessionId } = args;
    const mcpClient = new MCPClient();
    
    // First, check if we need to start the authentication flow or complete it
    if (!auth_url) {
      // Start the authentication flow by calling the MCP server
      const authResult = await mcpClient.callTool({
        name: 'authenticate_workspace_account',
        arguments: {
          email,
          category: category || 'default',
          description: description || 'Added via doAuthentication tool'
        },
        sessionId
      });
      
      // Parse the response to get the auth URL
      const response = JSON.parse(authResult.content as string);
      
      if (response.status === 'auth_required' && response.auth_url) {
        console.log('Please authenticate with Google:');
        console.log(`Opening browser to: ${response.auth_url}`);
        
        // Open the browser for the user to authenticate
        await open(response.auth_url);
        
        // Create readline interface to get the authorization code from the user
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        // Prompt the user for the authorization code
        const authCode = await rl.question('Please enter the authorization code from the browser: ');
        rl.close();
        
        if (!authCode) {
          return {
            content: 'Authentication cancelled. No authorization code provided.'
          };
        }
        
        // Complete the authentication flow with the authorization code
        const completeResult = await mcpClient.callTool({
          name: 'authenticate_workspace_account',
          arguments: {
            email,
            auth_code: authCode
          },
          sessionId
        });
        
        return {
          content: `Authentication completed successfully for ${email}. You can now use Google Workspace tools.`
        };
      } else {
        return {
          content: `Failed to start authentication flow: ${JSON.stringify(response)}`
        };
      }
    } else {
      // We already have an auth URL, so open the browser directly
      console.log('Please authenticate with Google:');
      console.log(`Opening browser to: ${auth_url}`);
      
      // Open the browser for the user to authenticate
      await open(auth_url);
      
      // Create readline interface to get the authorization code from the user
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Prompt the user for the authorization code
      const authCode = await rl.question('Please enter the authorization code from the browser: ');
      rl.close();
      
      if (!authCode) {
        return {
          content: 'Authentication cancelled. No authorization code provided.'
        };
      }
      
      // Complete the authentication flow with the authorization code
      const completeResult = await mcpClient.callTool({
        name: 'authenticate_workspace_account',
        arguments: {
          email,
          auth_code: authCode
        },
        sessionId
      });
      
      return {
        content: `Authentication completed successfully for ${email}. You can now use Google Workspace tools.`
      };
    }
  } catch (error) {
    console.error('Error in doAuthentication tool:', error);
    return {
      content: `Authentication failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}