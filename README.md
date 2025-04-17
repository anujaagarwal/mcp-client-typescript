

# Introducing Google Workspace MCP Client Application[Backend]

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [UI Guide](#ui-guide)
- [Usecase](#usecase)
- [API Integration](#api-integration)
- [UI Related Decisions](#ui-related-decisions)
- [Technologies Used](#technologies-used)
- [Known Issues](#known-issues)
- [Future Scope](#future-scope)
- [Deployment](#deployment)

## Project Overview

**MCP Recommendator** is a dynamic, AI-powered web application designed to help businesses, developers, and IT teams find and recommend the most relevant **MCP servers** based on user requirements. This tool leverages **AI-powered chat models** to process queries and suggest suitable servers. The user can then proceed to use the associated **MCP tools** for further actions. 

The application uses multiple state-of-the-art technologies to offer a seamless experience, ensuring that users can efficiently interact with **AI models** and retrieve **server recommendations** based on natural language inputs. 

---

## Getting Started

Follow these steps to run the project locally:

1. Clone the repository to your local machine:

   ```bash
   git clone https://github.com/your-repo/mcp-client-typescript.git
   ```

2. Navigate to the project directory:

   ```bash
   cd mcp-client-typescript
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

4. Set up your environment variables before starting the application. You can store environment variables under the `.env.local` file in the project.

Environment Variables used are:

```bash
  GOOGLE_GENERATIVE_AI_API_KEY="AIzaSyCyvGVg0NiowU-r3TOa96LIVMIAcdym6LA"
  GOOGLE_CLIENT_ID=""
  GOOGLE_CLIENT_SECRET=""

  
```

5. Start the development server:

   ```bash
   node build/index.js ./.mcp/google-workspace-mcp/build/index.js
   ```



