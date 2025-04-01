import { ToolInputParams, ToolReturnParams } from "../../models/types.js";
import { getFormattedCollectionSummary } from "../../persistence/summarizer.js";

export const getCollectionSummarySchema = {
  name: "collection_summary",
  description: [
    "Get a summary of all records in a collection, showing their IDs and summaries.",
    "When you have no idea about the contents of a collection, use this to get an",
    "overview instead of fetching individual records to find out. Always try to limit",
    "the number tokens used in your tasks.",
  ].join(" "),
  inputSchema: {
    type: "object",
    properties: {
      collection_name: {
        type: "string",
        description: "Name of the collection to summarize",
      },
    },
    required: ["collection_name"],
  },
};

/**
 * Tool function to get a summary of all records in a collection
 * Returns a formatted string with ID and summary of each record
 *
 * @param params - Tool input parameters containing collection name
 * @returns Tool return parameters with formatted summary text
 */
export async function getCollectionSummary(
  params: ToolInputParams
): Promise<ToolReturnParams> {
  console.log("getCollectionSummary", params);
  const { collection_name } = params.arguments ?? {};

  if (!collection_name || typeof collection_name !== "string") {
    console.log("Invalid collection name:", collection_name);
    return {
      success: false,
      type: "text",
      text: "'collection_name' must be present in the request params arguments",
    };
  }

  try {
    const summary = await getFormattedCollectionSummary(collection_name);

    return {
      success: true,
      type: "text",
      text: summary,
    };
  } catch (error) {
    console.log("Error getting collection summary:", error);
    return {
      success: false,
      type: "text",
      text: `Error getting collection summary: ${error}`,
    };
  }
}
