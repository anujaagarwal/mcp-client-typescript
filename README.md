

# Introducing MCP Recommendator

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
   git clone https://github.com/your-repo/mcp-recommendator
   ```

2. Navigate to the project directory:

   ```bash
   cd mcp-recommendator
   ```

3. Install project dependencies:

   ```bash
   npm install
   ```

4. Set up your environment variables before starting the application. You can store environment variables under the `.env.local` file in the project.

Environment Variables used are:

```bash
  GROQ_AI_API_KEY = your-api-key-here
  GROQ_CHAT_MODEL = "llama-4-scout-17b-16e-instruct"
  
```

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open your web browser and access the application at `http://localhost:3000/`.

---

## UI Guide

### UI Guide for MCP Recommendator

#### Overview:
The **MCP Recommendator** interface allows users to input queries, which the AI processes to recommend MCP servers. It also enables the user to interact with backend tools associated with the recommended servers.

#### Main Components:

1. **User Input Field:**
   - **Description:** A text field where users can type their query or request regarding MCP servers.
   - **Purpose:** This field helps the backend understand the user's need (e.g., "Recommend me an MCP server for cloud-based operations").
   
2. **Server Recommendation List:**
   - **Description:** A list dynamically updated based on the user's input query. The servers recommended by the backend appear here.
   - **Purpose:** This list provides users with server options that align with their needs.

3. **Apply Button:**
   - **Function:** After receiving the recommendation, users can select a server to interact with the MCP tools.
   - **Outcome:** Clicking this button triggers the tools associated with the recommended MCP server.

#### How to Use:
1. **Input Query:** Type your query about the required MCP server.
2. **View Recommendations:** The system will analyze your query and display the recommended MCP servers.
3. **Select Server:** Choose a recommended server to continue your workflow.
4. **Interact with Tools:** Once a server is selected, the corresponding tools will be available for interaction.

---

## Usecase:

1. **MCP Server Discovery:**
   The primary use case of this tool is to recommend suitable **MCP servers** based on user input. This could be beneficial for:
   - Developers looking for specific server configurations.
   - Businesses wanting to select the best server based on performance, cost, and location.

2. **Automation for IT Teams:**
   IT teams can automate the process of server selection for different business needs, enhancing efficiency and accuracy in infrastructure management.

---

## API Integration

- The **frontend** communicates with the **backend API** to analyze user queries and return appropriate MCP server recommendations.
- The backend uses **Google Generative AI** API to process the user's query and recommend relevant servers by searching through an external **MCP dataset** (from the provided `https://glama.ai/mcp/servers` URL).
- The **`/api/llm`** API route processes the input and communicates with the **aGENT API**, returning the results as a list of recommended servers.




## UI Related Decisions:

1. **Tailwind CSS**: 
   The frontend is styled using **Tailwind CSS**, a utility-first CSS framework that promotes responsive and fast development. It allows for easy customization and ensures the application is optimized for various screen sizes.

2. **Responsive Design**: 
   The application adapts to different screen sizes, making it accessible on both desktop and mobile devices. This flexibility ensures that all users can interact with the application in a seamless and user-friendly manner.

---

## Technologies Used

- **[React](https://react.dev/)**: The JavaScript library for building user interfaces.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework that simplifies styling.
- **[@modelContextProtocol]**


---

## Known Issues

- I will update this section after a while.

---

## Future Scope

1. **User Authentication**: We plan to implement authentication so users can save their queries and server recommendations for future reference.
2. **Enhanced Search Filtering**: Introduce more granular search filters, such as cost, location, and server type, to help users find their ideal server more effectively.
3. **Integration with Additional APIs**: In the future, we aim to integrate with more server datasets and recommendation engines for more accurate results.
4. **Streaming Server Updates**: Implement real-time server recommendations and streaming updates for users based on changing requirements.

---

## Deployment


