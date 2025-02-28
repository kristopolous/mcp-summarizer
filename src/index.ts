import { WorkerEntrypoint } from 'cloudflare:workers'
import { ProxyToSelf } from 'workers-mcp'

import { generateText, streamText } from "ai"

import { createGoogleGenerativeAI, google, GoogleGenerativeAIProviderSettings } from '@ai-sdk/google';


interface SummaryResponse {
  summary: string;
  originalText: string;
}

export default class MyWorker extends WorkerEntrypoint<Env> {
  /**
   * A warm, friendly greeting from your new Workers MCP server.
   * @param name {string} the name of the person we are greeting.
   * @return {string} the contents of our greeting.
   */
  sayHello(name: string) {
    return `Hello from an MCP Worker, ${name}!`
  }

  /**
   * Summarize the given text and return both summary and original text
   * @param text {string} the text to be summarized
   * @return {SummaryResponse} object containing both summary and original text
   */
  async summarizeText(text: string): Promise<SummaryResponse> {
    const model = google("models/gemini-2.0-flash-exp");
    const response = await generateText({
      model,
      prompt: `Please summarize the following text concisely while maintaining key points:

${text}`,
      temperature: 0.7,
    });

    return {
      summary: response.text,
      originalText: text
    };
  }

  /**
   * @ignore
   **/
  async fetch(request: Request): Promise<Response> {
    return new ProxyToSelf(this).fetch(request)
  }
}
