import { getServerDescription } from '../resources/server-description.js'
import { getToolsTextResponse } from '../../lib/utils.js'
import { CallToolResult, CallToolRequest } from '@modelcontextprotocol/sdk/types.js'
import { useLogger } from '../../lib/logger.js'
/**
 * Tool function to get collections data
 * @param request - Tool request (none required)
 * @returns Collections data
 */
export async function getResourceData(params: CallToolRequest['params']): Promise<CallToolResult> {
  try {
    const collectionsInfo = await getServerDescription()
    const collectionsText = collectionsInfo.contents[0].text

    if (typeof collectionsText !== 'string') {
      throw new Error('Collections data is not in the expected format')
    }

    return getToolsTextResponse(true, collectionsText)
  } catch (error) {
    useLogger().error('Error retrieving resource data:', error)
    return getToolsTextResponse(false, `Error retrieving resource data: ${error}`)
  }
}
