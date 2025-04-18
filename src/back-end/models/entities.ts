import { z } from 'zod'

/**
 * Schema for Resource entity that describe a MongoDB collection
 */
export const CollectionType = z.object({
  _id: z.union([z.string(), z.object({}).transform((obj) => obj.toString())]).optional(),

  // Unique identifier for the resource
  id: z.string(),

  // Human-readable name of the resource
  name: z.string(),

  // The actual MongoDB collection name
  collection_name: z.string(),

  // Description of what this collection stores
  description: z.string(),

  // This will contain the schema definition for documents in this collection
  // Should follow JSON Schema format, e.g.:
  // {
  //   type: "object",
  //   properties: {
  //     summary: { type: "string" },
  //     id: { type: "string" },
  //     name: { type: "string" },
  //     value: { type: "number" }
  //   },
  //   required: ["id", "name", "summary"]
  // }
  schema: z.object({
    type: z.literal('object'),
    properties: z
      .object({
        summary: z.object({
          type: z.string()
        })
      })
      .and(z.record(z.string(), z.any())),
    required: z.array(z.string())
  }),

  // Timestamps for auditing
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date())
})

// Type definition derived from the schema
export type CollectionType = z.infer<typeof CollectionType>

// MCP MODELS

/* Tools list */
export const McpListToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  inputSchema: z.object({
    type: z.literal('object'),
    properties: z.record(
      z.string(),
      z.object({
        type: z.string(),
        description: z.string()
      })
    ),
    required: z.array(z.string())
  })
})

export type McpListToolSchema = z.infer<typeof McpListToolSchema>

/* Resource list */
export const McpListResourceSchema = z.object({
  uri: z.string(),
  name: z.string(),
  description: z.string(),
  mimeType: z.string()
})

export type McpListResourceSchema = z.infer<typeof McpListResourceSchema>
