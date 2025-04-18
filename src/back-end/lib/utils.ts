import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'

// Helper function to transform a string to a JSON object
// If parsing fails, it tries to remove newlines only from outside of string values
export const transformStringToJson = (data: string) => {
  try {
    return JSON.parse(data)
  } catch (error) {
    // If parsing fails, try removing newlines only from outside of string values
    const cleanData = data.replace(/[\r\n\s]+(?=([^"]*"[^"]*")*[^"]*$)/g, '')
    return JSON.parse(cleanData)
  }
}

// Helper function to create a text response for tool calls
export function getToolsTextResponse(success: boolean, text: string): CallToolResult {
  return {
    content: [
      {
        success,
        type: 'text',
        text
      }
    ]
  }
}
