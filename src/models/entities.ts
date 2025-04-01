import { z } from "zod";

/**
 * Schema for Resource entity that describe a MongoDB collection
 */
export const CollectionType = z.object({
  _id: z.string().optional(),

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
  //     id: { type: "string" },
  //     name: { type: "string" },
  //     value: { type: "number" }
  //   },
  //   required: ["id", "name"]
  // }
  schema: z.record(z.string(), z.any()),

  // Timestamps for auditing
  created_at: z.date().default(() => new Date()),
  updated_at: z.date().default(() => new Date()),
});

// Type definition derived from the schema
export type CollectionType = z.infer<typeof CollectionType>;
