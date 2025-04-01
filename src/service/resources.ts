import { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import {
  getAllCollectionTypes,
  deleteCollectionType,
} from "../persistence/persistCollectionType.js";
import { getDynamicCollection } from "../persistence/persistCollectionData.js";

/**
 * Lists the resources collection as an MCP resource
 * @returns Object containing resource metadata
 */
export async function listResources() {
  return {
    resources: [
      {
        uri: "data://server-description",
        name: "Server Description",
        description: [
          "Description of the data service and its use cases.",
          "If you are an AI, fetch and read this first!",
        ].join(" "),
        mimeType: "text/plain",
      },
      {
        uri: "data://collections",
        name: "Available Collections",
        description:
          "Metadata about available collections (see schema attribute)",
        mimeType: "text/plain",
      },
    ],
  };
}

export function getServerDescription(): ReadResourceResult {
  return {
    contents: [
      {
        uri: "data://server-description",
        mimeType: "text/plain",
        name: "Server Description",
        text: [
          "AI-powered data collection manager enabling autonomous data operations with dynamic schemas.",
          "\n\nKey capabilities:\n",
          "- Persist data across conversations",
          "- Create and manage structured collections on-the-fly",
          "- Perform CRUD operations with schema validation",
          "\n\nIdeal for:\n",
          "- Knowledge bases: Organize information from conversations",
          "- Project tracking: Manage tasks, statuses, and deadlines",
          "- Learning content: Track progress and generate quizzes",
          "\n\nBest practice: Consider if current information might be" +
            " valuable in future conversations - if unsure, ask the user about storing it.",
          "\n\nNote: Maintains ~10 most recently used collections",
        ].join("\n"),
      },
    ],
  };
}

/**
 * Retrieves the contents of the resources collection
 * @returns Object containing the resource content
 */
export async function readCollectionsInfo(): Promise<ReadResourceResult> {
  // Get all resource collections
  const collections = await getAllCollectionTypes();

  // Filter out collections that don't exist in MongoDB and clean up their metadata
  const existingCollections = await Promise.all(
    collections.map(async (collection) => {
      try {
        const mongoCollection = await getDynamicCollection(
          collection.collection_name
        );

        // Check if collection exists by trying to list its indexes
        const hasIndexes = await mongoCollection.listIndexes().hasNext();

        if (!hasIndexes) {
          throw new Error("Collection has no indexes");
        }
        return collection;
      } catch (error) {
        console.log(
          `Collection ${collection.collection_name} does not exist in MongoDB, removing its type record`
        );
        // Delete the collection type record since the actual collection doesn't exist
        await deleteCollectionType(collection.id);
        return null;
      }
    })
  );

  // Remove null entries and sort by created_at in descending order
  const sortedCollections = existingCollections
    .filter(
      (collection): collection is NonNullable<typeof collection> =>
        collection !== null
    )
    .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
    .slice(0, 20);

  return {
    contents: [
      {
        uri: "data://collections",
        mimeType: "text/plain",
        name: "Available Collections",
        text: JSON.stringify(sortedCollections),
      },
    ],
  };
}
