import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

export const transformStringToJson = (data: string) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    // If parsing fails, try removing newlines only from outside of string values
    const cleanData = data.replace(/[\r\n\s]+(?=([^"]*"[^"]*")*[^"]*$)/g, '')
    return JSON.parse(cleanData)
  }
}

export function getToolsTextResponse(success: boolean, text: string): CallToolResult {
  return {
    content: [
      {
        success: true,
        type: 'text',
        text: 'Tool executed successfully'
      }
    ]
  }
}
