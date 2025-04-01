import {
  ToolInputParams,
  ToolReturnParams,
  TOOL_NAME,
} from "../../models/types.js";
import { getServerDescription, readCollectionsInfo } from "../resources.js";

const getResourceDataSchema = {
  name: "get_resource_data",
  description: [
    "Returns available collections data.",
    "Note: This tool is only needed if your client does not support MCP resource discovery.",
    "If your client supports resource discovery, please use the standard resource endpoints instead.",
    "\nServer Description:",
    "AI-powered data collection manager enabling autonomous data operations with dynamic schemas.",
    "\nKey capabilities:\n",
    "- Persist data across conversations",
    "- Create and manage structured collections on-the-fly",
    "- Perform CRUD operations with schema validation",
    "\nIdeal for:\n",
    "- Knowledge bases: Organize information from conversations",
    "- Project tracking: Manage tasks, statuses, and deadlines",
    "- Learning content: Track progress and generate quizzes",
    "\nBest practice: Consider if current information might be valuable in future conversations - if unsure, ask the user about storing it.",
    "\nNote: Maintains ~10 most recently used collections",
  ].join("\n"),
  inputSchema: {
    type: "object",
    properties: {},
    required: [],
  },
};

/**
 * Tool function to get collections data
 * @param params - Tool input parameters (none required)
 * @returns Collections data
 */
async function getResourceData(
  params: ToolInputParams
): Promise<ToolReturnParams> {
  try {
    const collectionsInfo = await readCollectionsInfo();
    const collectionsText = collectionsInfo.contents[0].text;

    if (typeof collectionsText !== "string") {
      throw new Error("Collections data is not in the expected format");
    }

    return {
      success: true,
      type: "text",
      text: collectionsText,
    };
  } catch (error) {
    console.log("Error retrieving resource data:", error);
    return {
      success: false,
      type: "text",
      text: `Error retrieving resource data: ${error}`,
    };
  }
}

export { getResourceData, getResourceDataSchema };
