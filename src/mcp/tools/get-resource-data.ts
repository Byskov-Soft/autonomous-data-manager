import { TOOL_NAME } from '../../models/enums.js'
import { readCollectionsInfo } from '../resources/server-description.js'
import { getToolsTextResponse } from '../../lib/utils.js'
import { CallToolResult, CallToolRequest } from '@modelcontextprotocol/sdk/types.js'

export const getResourceDataSchema = {
  name: TOOL_NAME.GET_RESOURCE_DATA,
  description: [
    'Returns available collections data.',
    'Note: This tool is only needed if your client does not support MCP resource discovery.',
    'If your client supports resource discovery, please use the standard resource endpoints instead.',
    '\nServer Description:',
    'AI-powered data collection manager enabling autonomous data operations with dynamic schemas.',
    '\nKey capabilities:\n',
    '- Persist data across conversations',
    '- Create and manage structured collections on-the-fly',
    '- Perform CRUD operations with schema validation',
    '\nIdeal for:\n',
    '- Knowledge bases: Organize information from conversations',
    '- Project tracking: Manage tasks, statuses, and deadlines',
    '- Learning content: Track progress and generate quizzes',
    '\nBest practice: Consider if current information might be valuable in future conversations - if unsure, ask the user about storing it.',
    '\nNote: Maintains ~10 most recently used collections'
  ].join('\n'),
  inputSchema: {
    type: 'object',
    properties: {},
    required: []
  }
}

/**
 * Tool function to get collections data
 * @param request - Tool request (none required)
 * @returns Collections data
 */
export async function getResourceData(params: CallToolRequest['params']): Promise<CallToolResult> {
  try {
    const collectionsInfo = await readCollectionsInfo()
    const collectionsText = collectionsInfo.contents[0].text

    if (typeof collectionsText !== 'string') {
      throw new Error('Collections data is not in the expected format')
    }

    return getToolsTextResponse(true, collectionsText)
  } catch (error) {
    console.log('Error retrieving resource data:', error)
    return getToolsTextResponse(false, `Error retrieving resource data: ${error}`)
  }
}
