import { getNextOrderNumber } from '../../persistence/operations/common.js'
import { getToolsTextResponse } from '../../lib/utils.js'
import { CallToolRequest, CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { TOOL_NAME } from '../../models/enums.js'
import { z } from 'zod'

export const getNextInOrderSequenceSchema = {
  name: TOOL_NAME.GET_NEXT_IN_ORDER_SEQUENCE,
  description:
    'Get the next order number to use for a collection by finding the highest existing order value and adding 1',
  inputSchema: {
    type: 'object',
    properties: {
      collection_name: {
        type: 'string',
        description: 'Name of the collection to get the next order number for'
      }
    },
    required: ['collection_name']
  }
}

/**
 * Tool function to get the next order number for a collection
 * This function is used with the CallToolRequestSchema MCP handler
 *
 * @param params - Object containing the collection name
 * @returns Object with the next order number
 */
export async function getNextInOrderSequence(params: CallToolRequest['params']): Promise<CallToolResult> {
  console.log('Getting next order number:', params)
  let collectionName: string

  // Resolve the input parameters
  try {
    collectionName = z.string().min(1).parse(params?.arguments?.collection_name)
  } catch {
    return getToolsTextResponse(false, "'collection_name' must be present in the request params arguments")
  }

  try {
    const nextOrderNumber = await getNextOrderNumber(collectionName)

    // Format the response according to the required CallToolResult format
    return {
      name: TOOL_NAME.GET_NEXT_IN_ORDER_SEQUENCE,
      content: [
        {
          type: 'text',
          text: JSON.stringify({ nextOrderNumber })
        }
      ]
    }
  } catch (error) {
    console.log('Error getting next order number:', (error as Error).message)
    return getToolsTextResponse(false, `Error getting next order number: ${error}`)
  }
}
