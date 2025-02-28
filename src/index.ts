import { WorkerEntrypoint } from 'cloudflare:workers'
import { ProxyToSelf } from 'workers-mcp'

import { generateText, streamText } from "ai"
import { createGoogleGenerativeAI } from '@ai-sdk/google';

interface Env {
  GOOGLE_GENERATIVE_AI_API_KEY: string;
  SHARED_SECRET: string;
}

interface ContentResponse {
  summary: string;
  type: string;
}

export default class MyWorker extends WorkerEntrypoint<Env> {
  /**
   * A warm, friendly greeting from your new Workers MCP server.
   * @param name {string} the name of the person we are greeting.
   * @return {string} the contents of our greeting.
   */
  sayHello(name: string) {
    return `Hello from an MCP Worker2, ${name}!`
  }

  /**
   * summarize content for the given text
   * @param text {string} the text to be summarize
   * @return {string}  content summary
   */
  async summarizeText(text: string): Promise<string> {
    const google = createGoogleGenerativeAI({
      apiKey: this.env.GOOGLE_GENERATIVE_AI_API_KEY
    });

    const model = google("models/gemini-2.0-flash-exp");

    const poeticPrompt = `请总结以下内容：${text}`;
    
    const response = await generateText({
      model,
      prompt: poeticPrompt
    });

    return response.text
  }

  /**
   * @ignore
   **/
  async fetch(request: Request): Promise<Response> {
    return new ProxyToSelf(this).fetch(request)
  }
}
