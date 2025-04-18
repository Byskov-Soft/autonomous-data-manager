import { loadAsync } from 'node-yaml-config'
import { McpListResourceSchema, McpListToolSchema } from '../models/entities.js'
import { useLogger } from './logger.js'

type McpListSchema = Record<string, unknown>
let resourcesSchema: McpListSchema | null = null
let toolsSchema: McpListSchema | null = null

// Load resources and tools descriptions (for list commands) from files
export const loadResourcesSchema = async (resourceSchemaFile: string) => {
  if (!resourcesSchema) {
    resourcesSchema = (await loadAsync(resourceSchemaFile)) as McpListSchema
  }
}

export const loadToolsSchema = async (toolsSchemaFile: string) => {
  if (!toolsSchema) {
    toolsSchema = (await loadAsync(toolsSchemaFile)) as McpListSchema
  }
}

// Get a specific resource list schema
export const getResourceListSchema = (rootSegment: string): McpListResourceSchema => {
  const log = useLogger()

  if (!resourcesSchema) {
    throw new Error(
      `Resources schema file is not loaded. Remember to run "loadResourcesSchema(pathToResourceSchemaFile).`
    )
  }

  if (!resourcesSchema[rootSegment]) {
    throw new Error(`Unable to find rootSegment "${rootSegment}" in resources schema.`)
  }

  try {
    return McpListResourceSchema.parse(resourcesSchema[rootSegment])
  } catch (e) {
    log.error((e as Error).message, `\nError parsing "${rootSegment}" from schema.`)
    throw e
  }
}

// Get a specific tool list schema
export const getToolListSchema = (rootSegment: string): McpListToolSchema => {
  const log = useLogger()
  if (!toolsSchema) {
    throw new Error(
      `Tools schema file is not loaded. Remember to run "loadTooleSchema(pathToToolsSchemaFile).`
    )
  }

  if (!toolsSchema[rootSegment]) {
    throw new Error(`Unable to find rootSegment "${rootSegment}" in tools schema."`)
  }

  try {
    return McpListToolSchema.parse(toolsSchema[rootSegment])
  } catch (e) {
    log.error((e as Error).message, `\nError parsing "${rootSegment}" from schema.`)
    throw e
  }
}
