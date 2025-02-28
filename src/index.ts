#!/usr/bin/env node

import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';


// Create an MCP server
const server = new McpServer({
    name: "Text Summarizer",
    version: "1.0.0"
});

// Add a text summarization tool
server.tool("summarize",
    {
        text: z.string().min(1),
        maxLength: z.number().optional().default(200),
        language: z.string().optional().default("en")
    },
    async ({ text, maxLength, language }) => {
        try {
            const prompt = `Please summarize the following text in ${language}, keeping the summary within ${maxLength} characters:\n\n${text}`;

            const model = google.chat("gemini-1.5-pro");
            const result = await generateText({
                model: model,
                prompt: prompt,
                maxTokens: maxLength,
                temperature: 0.5
            });

            return {
                content: [{
                    type: "text",
                    text: result.text
                }]
            };
        } catch (error) {
            console.error('Summarization error:', error);
            throw new Error('Failed to generate summary');
        }
    }
);

// Add a dynamic greeting resource
server.resource(
    "greeting",
    new ResourceTemplate("greeting://{name}", { list: undefined }),
    async (uri, { name }) => ({
        contents: [{
            uri: uri.href,
            text: `Hello, ${name}!`
        }]
    })
);

// Start receiving messages on stdin and sending messages on stdout
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
});