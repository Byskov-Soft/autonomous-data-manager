import { ReadResourceResult, Resource } from '@modelcontextprotocol/sdk/types.js'
import { RESOURCE_NAME } from '../../models/enums.js'

/**
 * Retrieves the contents of the server description resource
 */
export function getServerDescription(): Promise<ReadResourceResult> {
  return Promise.resolve({
    contents: [
      {
        uri: `data://${RESOURCE_NAME.SERVER_DESCRIPTION}`,
        mimeType: 'text/plain',
        name: 'Server Description',
        text: [
          'AI-powered data collection manager enabling autonomous data operations with dynamic schemas.',
          'Key capabilities:',
          '- Persist data across conversations',
          '- Create and manage structured collections on-the-fly',
          '- Perform CRUD operations with schema validation',
          'Ideal for:',
          '- Knowledge bases: Organize information from conversations',
          '- Project tracking: Manage tasks, statuses, and deadlines',
          '- Learning content: Track progress and generate quizzes',
          'Best practice: Consider if current information might be' +
            ' valuable in future conversations - if unsure, ask the user about storing it.'
        ].join('\n')
      }
    ]
  })
}
