import dotenv from "dotenv";
dotenv.config();
interface Tool {
	name: string;
	description: string;
}
interface MCPServer {
	name: string;
	url: string;
	description?: string;
	author?: string;
	license?: string;
	tags?: Array<string>;
	requirements?: Record<string,string>; // node_version, api_key
	tools: Array<Tool>
	env: Record<string,string> // GITHUB_TOKEN=xxx
}

export const mcpServerDatabase: MCPServer[] =
[
  {
    "name": "DataWorks MCP Server",
    "url": "https://github.com/aliyun/alibabacloud-dataworks-mcp-server",
    "description": "A Model Context Protocol server that enables AI agents to interact with Alibaba Cloud DataWorks through standardized interfaces",
    "author": "by Alibaba Cloud",
    "license": "Apache 2.0",
    "tags": [
      "Cloud Platforms",
      "Developer Tools"
    ],
    "requirements": {
      "node_version": "v16 or higher",
      "api_key": "ALIBABA_CLOUD_ACCESS_KEY_ID and ALIBABA_CLOUD_ACCESS_KEY_SECRET required"
    },
    "tools": [
      {
        "name": "ListProjects",
        "description": "Queries a list of DataWorks workspaces"
      },
      {
        "name": "CreateFile",
        "description": "Creates a file in DataStudio"
      },
      {
        "name": "SubmitFile",
        "description": "Commits a file to the development environment"
      },
      {
        "name": "DeployFile",
        "description": "Deploys a file to the production environment"
      },
      {
        "name": "CreateDIJob",
        "description": "Creates a new-version synchronization task"
      },
      {
        "name": "StartDIJob",
        "description": "Starts a synchronization task"
      }
    ],
    "env": {}
  },
  {
    "name": "Nefino MCP Server",
    "url": "https://github.com/nefino/mcp-nefino",
    "description": "Provides Large Language Models with access to news and information about renewable energy projects in Germany",
    "author": "by Nefino",
    "license": "Apache 2.0",
    "tags": [
      "Research & Data",
      "Location Services"
    ],
    "requirements": {
      "node_version": "Python 3.10 or higher",
      "api_key": "Nefino API credentials required"
    },
    "tools": [
      {
        "name": "StartNewsRetrieval",
        "description": "Start an asynchronous news retrieval task for a place"
      },
      {
        "name": "GetNewsResults",
        "description": "Get the results of a previously started news retrieval task"
      }
    ],
    "env": {}
  },
  {
    "name": "GitHub Projects MCP Server",
    "url": "https://github.com/taylor-lindores-reeves/mcp-github-projects",
    "description": "An MCP (Model Context Protocol) server that enables AI agents to create and manage Agile Sprint-based projects using GitHub Projects.",
    "author": "by taylor-lindores-reeves",
    "license": "MIT License",
    "tags": [
      "Developer Tools"
    ],
    "requirements": {
      "node_version": "N/A",
      "api_key": "GITHUB_TOKEN"
    },
    "tools": [
      {
        "name": "get-repository",
        "description": "Get a GitHub repository by owner and name"
      },
      {
        "name": "list-repositories",
        "description": "List repositories for a user"
      },
      {
        "name": "get-project",
        "description": "Get a GitHub Project by ID"
      },
      {
        "name": "list-projects",
        "description": "List GitHub Projects for a user"
      },
      {
        "name": "get-project-columns",
        "description": "Get status columns for a GitHub Project"
      },
      {
        "name": "get-project-fields",
        "description": "Get fields for a GitHub Project"
      },
      {
        "name": "get-project-items",
        "description": "Get items (issues) from a GitHub Project"
      },
      {
        "name": "create-project-item",
        "description": "Add an issue or PR to a GitHub Project"
      },
      {
        "name": "update-project-item-field",
        "description": "Update a field value for a project item"
      },
      {
        "name": "create-project",
        "description": "Create a new GitHub Project"
      },
      {
        "name": "update-project",
        "description": "Update an existing GitHub Project"
      },
      {
        "name": "delete-project",
        "description": "Delete a GitHub Project"
      },
      {
        "name": "copy-project",
        "description": "Copy a GitHub Project"
      },
      {
        "name": "add-draft-issue",
        "description": "Add a draft issue to a GitHub Project"
      },
      {
        "name": "convert-draft-issue",
        "description": "Convert a draft issue to a regular issue"
      },
      {
        "name": "add-item-to-project",
        "description": "Add an existing issue or PR to a GitHub Project"
      },
      {
        "name": "update-item-position",
        "description": "Update the position of an item in a GitHub Project"
      },
      {
        "name": "delete-project-item",
        "description": "Remove an item from a GitHub Project"
      },
      {
        "name": "create-project-field",
        "description": "Create a new field in a GitHub Project"
      },
      {
        "name": "update-project-field",
        "description": "Update a field in a GitHub Project"
      },
      {
        "name": "delete-project-field",
        "description": "Delete a field from a GitHub Project"
      },
      {
        "name": "update-project-status",
        "description": "Update the status of a GitHub Project"
      },
      {
        "name": "archive-project-item",
        "description": "Archive an item in a GitHub Project"
      },
      {
        "name": "unarchive-project-item",
        "description": "Unarchive an item in a GitHub Project"
      },
      {
        "name": "clear-item-field-value",
        "description": "Clear a field value for an item in a GitHub Project"
      },
      {
        "name": "mark-project-as-template",
        "description": "Mark a GitHub Project as a template"
      },
      {
        "name": "unmark-project-as-template",
        "description": "Unmark a GitHub Project as a template"
      },
      {
        "name": "get-issue",
        "description": "Get a GitHub issue by number"
      },
      {
        "name": "list-issues",
        "description": "List issues for a repository"
      },
      {
        "name": "create-issue",
        "description": "Create a new GitHub issue"
      },
      {
        "name": "update-issue",
        "description": "Update an existing GitHub issue"
      }
    ],
    "env": {
        "GITHUB_TOKEN":"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",
        "GITHUB_OWNER":"anujaagarwal"
    }
  },
  {
    "name": "EdgeOne Pages MCP",
    "url": "/",
    "description": "remote-capable server",
    "author": "by TencentEdgeOne",
    "license": "1,369",
    "tags": [
      "Cloud Platforms",
      "Developer Tools"
    ],
    "requirements": {
      "node_version": "Requirements",
      "api_key": "N/A"
    },
    "tools": [
      {
        "name": "deploy-html",
        "description": "No description available"
      }
    ],
    "env": {}
  },
  {
    "name": "Azure MCP Server",
    "url": "/",
    "description": "local-only server",
    "author": "by kalivaraprasad-gonapa",
    "license": "MIT License",
    "tags": [
      "Cloud Platforms",
      "Security"
    ],
    "requirements": {
      "node_version": "N/A",
      "api_key": "N/A"
    },
    "tools": [
      {
        "name": "list-tenants",
        "description": "No description available"
      }
    ],
    "env": {}
  },
  {
    "name": "ScrapeGraph MCP Server",
    "url": "/",
    "description": "remote-capable server",
    "author": "by ScrapeGraphAI",
    "license": "MIT License",
    "tags": [
      "Browser Automation",
      "Search"
    ],
    "requirements": {
      "node_version": "N/A",
      "api_key": "Required"
    },
    "tools": [
      {
        "name": "searchscraper",
        "description": "No description available"
      }
    ],
    "env": {}
  },
  {
    "name": "302AI Sandbox MCP Server",
    "url": "/",
    "description": "remote-capable server",
    "author": "by 302ai",
    "license": "MIT License",
    "tags": [
      "Developer Tools"
    ],
    "requirements": {
      "node_version": "N/A",
      "api_key": "Required"
    },
    "tools": [
      {
        "name": "runCommand",
        "description": "No description available"
      }
    ],
    "env": {}
  },
  {
    "name": "ScreenshotOne MCP Server",
    "url": "/",
    "description": "remote-capable server",
    "author": "by screenshotone",
    "license": "MIT License",
    "tags": [
      "Browser Automation",
      "Image & Video Processing"
    ],
    "requirements": {
      "node_version": "N/A",
      "api_key": "Required"
    },
    "tools": [
      {
        "name": "render-website-screenshot",
        "description": "No description available"
      }
    ],
    "env": {}
}

]

  
