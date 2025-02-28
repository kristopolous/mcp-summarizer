import { WorkerEntrypoint } from 'cloudflare:workers'
import { ProxyToSelf } from 'workers-mcp'

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
  summarizeText(text: string): SummaryResponse {
    // 这里是一个模拟的摘要，实际项目中可以接入真实的摘要服务
    const mockSummary = `这是"${text.slice(0, 50)}..."的摘要：${text.slice(0, 100)}...`;
    
    return {
      summary: mockSummary,
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
