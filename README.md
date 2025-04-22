# MCP Client with Next.js Chat Interface

This project integrates the Model Context Protocol (MCP) client with a Next.js chat interface. It allows users to interact with MCP tools through a natural language chat interface.

## Features

- Natural language chat interface for interacting with MCP tools
- Google OAuth authentication
- Integration with Google Generative AI (Gemini)
- Real-time chat with tool suggestions
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18.x or later
- Docker (for running MCP server)
- Google Cloud Platform account with:
  - OAuth 2.0 credentials
  - Google Generative AI API access

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mcp-client-typescript.git
   cd mcp-client-typescript
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # Google Generative AI
   GOOGLE_GENERATIVE_AI_API_KEY=your_google_generative_ai_api_key

   # NextAuth.js
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Set up Google OAuth:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google OAuth API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000/api/auth/callback/google` to the authorized redirect URIs

5. Set up Google Generative AI:
   - Go to the [Google AI Studio](https://makersuite.google.com/)
   - Create an API key
   - Add the API key to your `.env.local` file

## Running the Application

1. Start the development server:
   ```
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

3. Sign in with your Google account

4. Start chatting with the MCP tools!

## Project Structure

- `src/app`: Next.js app router pages and API routes
- `src/components`: React components
- `src/lib`: MCP client and utility functions
- `src/types`: TypeScript type definitions

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- NextAuth.js
- Google Generative AI (Gemini)
- Model Context Protocol (MCP)

## License

ISC

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



