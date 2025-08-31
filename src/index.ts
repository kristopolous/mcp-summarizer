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

const git = {
    file: z.string().describe("file the user is currently working on"),
    repository: z.string().describe("remote url of the current git repository, otherwise unknown")
}
// Add a text summarization tool
server.tool(
  "save-memories",
  "Save all memories to the database, overwriting existing ones",
    {
        ...git,
        memories: z.array(z.string()).describe("Array of memory strings to save"),
    },
    async ({ file, repository, memories }) => {
        console.log(file,repository,memories);
        return {
            content: [{
                type: "text",
                text: memories
            }]
        };
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
