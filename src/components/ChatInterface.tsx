"use client";

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useSession } from 'next-auth/react';
import { Session } from 'next-auth';
import MarkdownRenderer from './MarkdownRenderer';

interface CustomSession extends Session {
    accessToken?: string;
    refreshToken?: string;
}

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    toolName?: string;
    toolArgs?: any;
    requiresUserInput?: boolean;
    isMarkdown?: boolean;
}

interface Tool {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: Record<string, {
            type: string;
            description: string;
            required?: boolean;
        }>;
    };
}

interface ToolInputField {
    name: string;
    type: string;
    description: string;
    required: boolean;
    value: string;
}

interface ContentItem {
    type: string;
    text: string;
}

const ChatInterface: React.FC = () => {
    const { data: session } = useSession() as { data: CustomSession | null };
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [availableTools, setAvailableTools] = useState<Tool[]>([]);
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const [toolInputs, setToolInputs] = useState<ToolInputField[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch available tools when component mounts
        const fetchTools = async () => {
            try {
                // Use the getTools action to fetch available tools
                const response = await fetch('/api/mcp', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'getTools'
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch tools');
                }

                const data = await response.json();


                if (data.tools && data.tools.length > 0) {
                    setAvailableTools(data.tools);

                    // Add a simple welcome message without tool descriptions
                    setMessages(prev => [...prev, {
                        role: 'system',
                        content: 'How can I assist you today?'
                    }]);
                } else {
                    // If no tools are available, try to connect first
                    const connectResponse = await fetch('/api/mcp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            action: 'connect',
                            access_token: session?.accessToken,
                            refresh_token: session?.refreshToken
                        })
                    });

                    if (!connectResponse.ok) {
                        throw new Error('Failed to connect to MCP server');
                    }

                    const connectData = await connectResponse.json();

                    if (connectData.tools && connectData.tools.length > 0) {
                        setAvailableTools(connectData.tools);

                        // Add a simple welcome message without tool descriptions
                        setMessages(prev => [...prev, {
                            role: 'system',
                            content: 'How can I assist you today?'
                        }]);
                    } else {
                        throw new Error('No tools available after connection');
                    }
                }
            } catch (error) {
                console.error('Error fetching tools:', error);
                setMessages(prev => [...prev, {
                    role: 'system',
                    content: 'Failed to load available tools. Please try refreshing the page.'
                }]);
            }
        };

        if (session) {
            fetchTools();
        }
    }, [session]);

    const handleToolSelection = (tool: Tool) => {
        setActiveTool(tool);
        const inputs: ToolInputField[] = Object.entries(tool.input_schema.properties).map(([name, prop]) => ({
            name,
            type: prop.type,
            description: prop.description,
            required: prop.required || false,
            value: ''
        }));
        setToolInputs(inputs);
    };

    const handleToolInputChange = (name: string, value: string) => {
        setToolInputs(prev => prev.map(input =>
            input.name === name ? { ...input, value } : input
        ));
    };

    const handleToolSubmit = async () => {
        if (!activeTool) return;

        console.log('Starting tool execution:', activeTool.name);
        console.log('Tool inputs:', toolInputs);

        const args = toolInputs.reduce((acc, input) => {
            // Special handling for send_workspace_email tool
            if (activeTool.name === 'send_workspace_email' && input.name === 'to') {
                // Split the comma-separated email addresses and trim whitespace
                return {
                    ...acc,
                    [input.name]: input.value.split(',').map(email => email.trim())
                };
            }
            return {
                ...acc,
                [input.name]: input.value
            };
        }, {});

        console.log('Constructed args:', args);
        console.log('Session tokens:', {
            accessToken: session?.accessToken ? 'present' : 'missing',
            refreshToken: session?.refreshToken ? 'present' : 'missing'
        });

        setIsLoading(true);
        try {
            // Use the MCP API endpoint instead of /api/chat
            const response = await fetch('/api/mcp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'invokeTool',
                    toolName: activeTool.name,
                    toolArgs: args,
                    access_token: session?.accessToken,
                    refresh_token: session?.refreshToken
                })
            });

            console.log('API response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Tool execution failed:', errorData);
                throw new Error(`Failed to execute tool: ${errorData.error || response.statusText}`);
            }

            const data = await response.json();
            console.log('Tool execution response:', data);

            // Extract the content from the result
            let resultContent = '';
            if (data.result) {
                if (data.result.isError) {
                    resultContent = `Error: ${data.result.content?.[0]?.text || 'Unknown error occurred'}`;
                } else if (data.result.content && Array.isArray(data.result.content)) {
                    // Handle array of content objects
                    resultContent = data.result.content.map((item: ContentItem) => {
                        if (item.type === 'text' && item.text) {
                            try {
                                // Try to parse the text as JSON to extract meaningful information
                                const parsedText = JSON.parse(item.text);
                                if (parsedText.success && parsedText.data) {
                                    // Format the data in a user-friendly way
                                    if (parsedText.data.name && parsedText.data.webViewLink) {
                                        return `Created folder "${parsedText.data.name}" with link: ${parsedText.data.webViewLink}`;
                                    } else if (parsedText.data.id) {
                                        return `Operation successful. ID: ${parsedText.data.id}`;
                                    }
                                    return `Operation successful: ${JSON.stringify(parsedText.data, null, 2)}`;
                                }
                                return item.text;
                            } catch (e) {
                                // If it's not valid JSON, return the text as is
                                return item.text;
                            }
                        }
                        return '';
                    }).filter((text: string) => text).join('\n');
                } else if (typeof data.result === 'string') {
                    resultContent = data.result;
                } else {
                    resultContent = JSON.stringify(data.result, null, 2);
                }
            } else {
                resultContent = 'Tool executed successfully';
            }

            // Add messages to the chat
            setMessages(prev => [...prev,
            { role: 'user', content: `Using ${activeTool.name}` },
            { role: 'assistant', content: resultContent, isMarkdown: true }
            ]);

            // Reset tool state
            setActiveTool(null);
            setToolInputs([]);
        } catch (error: any) {
            console.error('Error executing tool:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `Sorry, there was an error executing the tool: ${error.message}`,
                isMarkdown: true
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Add user message to chat
        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Send query to MCP API
            const response = await fetch('/api/mcp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'query',
                    query: input,
                    access_token: session?.accessToken,
                    refresh_token: session?.refreshToken,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Extract the content from the response
            let content = '';
            if (data.error) {
                content = `Error: ${data.error}`;
            } else if (data.response) {
                content = typeof data.response === 'string' ? data.response : JSON.stringify(data.response);

                // Check if the response contains a tool execution request
                if (typeof data.response === 'string' &&
                    data.response.includes('tool_name') &&
                    data.response.includes('tool_arguments')) {
                    try {
                        // Extract the JSON part from the response
                        const jsonMatch = data.response.match(/json\n({[\s\S]*?})/);
                        if (jsonMatch && jsonMatch[1]) {
                            const toolRequest = JSON.parse(jsonMatch[1]);

                            // Find the tool in available tools
                            const tool = availableTools.find(t => t.name === toolRequest.tool_name);
                            if (tool) {
                                // Set up the tool inputs
                                setActiveTool(tool);
                                const inputs: ToolInputField[] = Object.entries(tool.input_schema.properties).map(([name, prop]) => ({
                                    name,
                                    type: prop.type,
                                    description: prop.description,
                                    required: prop.required || false,
                                    value: toolRequest.tool_arguments[name] || ''
                                }));
                                setToolInputs(inputs);

                                // Add a message about the tool being set up
                                content = `I'll help you ${toolRequest.tool_name.replace(/_/g, ' ')}. Please review and confirm the details.`;
                            }
                        }
                    } catch (parseError) {
                        console.error('Error parsing tool request:', parseError);
                    }
                }
            } else if (data.result) {
                if (typeof data.result === 'string') {
                    content = data.result;
                } else if (data.result.content) {
                    content = data.result.content[0]?.text|| JSON.stringify(data.result.content);
                } else if (data.result.text) {
                    content = data.result.text;
                } else {
                    content = JSON.stringify(data.result, null, 2);
                }
            } else {
                content = 'No response received';
            }

            // Add assistant response to chat
            const assistantMessage: Message = {
                role: 'assistant',
                content,
                isMarkdown: true
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error processing query:', error);
            setMessages(prev => [...prev, {
                role: 'system',
                content: 'An error occurred while processing your request.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-200">
            {/* Sidebar with Tools */}
            <aside className="w-72 bg-white shadow-lg rounded-r-xl overflow-hidden flex flex-col">
                <div className="p-6 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 tracking-wider">Available Tools</h2>
                    <p className="text-sm text-gray-500 mt-1">Select a tool to get started.</p>
                </div>

                <div className="flex-grow overflow-y-auto px-4 py-2 space-y-1">
                    {availableTools.map((tool) => (
                        <button
                            key={tool.name}
                            className="group w-full py-3 px-4 flex items-center justify-between rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            onClick={() => handleToolSelection(tool)}
                        >
                            <span className="text-gray-700 font-medium">{tool.name}</span>
                            <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </button>
                    ))}
                </div>
                <div className="border-t border-gray-200 p-4">
                    <p className="text-xs text-gray-500">Having issues? <a href="#" className="text-blue-500 hover:underline">Contact support</a></p>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col bg-gray-100 rounded-l-xl shadow-inner overflow-hidden">
                <header className="bg-white p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-gray-800">AI Chat Assistant</h1>
                    <p className="text-sm text-gray-500 mt-1">Ask me anything or use a tool from the sidebar.</p>
                </header>

                <div className="flex-grow p-6 space-y-4 overflow-y-auto">
                    {messages.map((message, index) => (
                        <div key={index} className={`rounded-xl p-4 max-w-2xl ${message.role === 'user' ? 'bg-blue-100 ml-auto text-right' : message.role === 'system' ? 'bg-green-100' : 'bg-gray-50 mr-auto'}`}>
                            {message.isMarkdown ? (
                                <ReactMarkdown
                                    components={{
                                        p: ({ children }) => <p className="prose prose-sm max-w-none text-gray-800">{children}</p>
                                    }}
                                >
                                    {typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}
                                </ReactMarkdown>
                            ) : (
                                <div className="text-gray-800">
                                    {typeof message.content === 'string' ? message.content : JSON.stringify(message.content, null, 2)}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {activeTool ? (
                    <div className="bg-white p-6 border-t border-gray-200 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Configure Tool: {activeTool.name}</h3>
                        <div className="space-y-4">
                            {toolInputs.map(input => (
                                <div key={input.name} className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-600">{input.name}{input.required && <span className="text-red-500">*</span>}</label>
                                    <input
                                        type={input.type === 'string' ? 'text' : input.type === 'integer' || input.type === 'number' ? 'number' : 'text'}
                                        value={input.value}
                                        onChange={(e) => handleToolInputChange(input.name, e.target.value)}
                                        className="mt-1 p-2 border rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                                        placeholder={input.description}
                                        required={input.required}
                                    />
                                </div>
                            ))}
                            <div className="flex justify-end">
                                <button onClick={() => setActiveTool(null)} className="px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 focus:outline-none">Cancel</button>
                                <button
                                    onClick={handleToolSubmit}
                                    disabled={isLoading || toolInputs.some(input => input.required && !input.value)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                                >
                                    {isLoading ? 'Executing...' : 'Execute'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-white p-6 border-t border-gray-200 shadow-sm flex items-center">
                        <input
                            type="text"
                            placeholder="Type your message here..."
                            value={input}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className="flex-grow p-3 border rounded-md shadow-sm focus:ring focus:ring-blue-200 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                        >
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </form>
                )}
            </main>
        </div>
    );
};

export default ChatInterface;
