import Djv from "djv";
import { ToolInputParams, ToolReturnParams } from "../../models/types.js";
import { insertIntoCollection } from "../../persistence/persistCollectionData.js";
import { getCollectionTypeByCollectionName } from "../../persistence/persistCollectionType.js";
import { formDataToJson } from "../../utils.js";

const MARKDOWN_ENCOURAGEMENT =
  "Use Markdown format for better readability - use # for headers, ``` for code blocks, - for lists";

const addToCollectionSchema = {
  name: "add_to_collection",
  description: "Add a document to a collection with schema validation",
  inputSchema: {
    type: "object",
    properties: {
      collection_name: {
        type: "string",
        description: "Name of the collection to add the document to",
      },
      document: {
        type: "string",
        description: [
          "JSON string containing the document to add to the collection.",
          "Must match the collection's schema. To ensure successful saving,",
          "always provide data to the MCP server in valid JSON format, remembering",
          "to properly escape special characters within string values.",
          "When adding large text values, it is encouraged to " +
            MARKDOWN_ENCOURAGEMENT,
        ].join(" "),
      },
    },
    required: ["collection_name", "document"],
  },
};

/**
 * Tool function to add a document to a collection with schema validation
 * @param params - Tool input parameters containing collection name and document
 * @returns Tool return parameters with success/failure message
 */
async function addToCollection(
  params: ToolInputParams
): Promise<ToolReturnParams> {
  console.log("addToCollection", params);
  const { collection_name, document } = params.arguments ?? {};

  // Validate input parameters
  if (!collection_name || typeof collection_name !== "string") {
    console.log("Invalid collection name:", collection_name);
    return {
      success: false,
      type: "text",
      text: "'collection_name' must be present in the request params arguments",
    };
  }

  if (!document || typeof document !== "string") {
    console.log("Invalid document:", document);
    return {
      success: false,
      type: "text",
      text: "'document' must be present in the request params arguments",
    };
  }

  try {
    // Parse the document data from JSON string
    let parsedDocument: Record<string, unknown>;

    try {
      parsedDocument = formDataToJson(document);
    } catch (error) {
      console.log("Invalid JSON in document:", error);
      return {
        success: false,
        type: "text",
        text: `Invalid JSON in document: ${error}`,
      };
    }

    // Get the collection type metadata to validate against schema
    const collectionType = await getCollectionTypeByCollectionName(
      collection_name
    );

    if (!collectionType) {
      console.log("Collection type not found:", collection_name);
      return {
        success: false,
        type: "text",
        text: `Collection '${collection_name}' does not exist`,
      };
    }

    // Check if validation is enabled
    const env = process.env;
    const validationEnabled = env.COLLECTION_VALIDATION !== "off";

    // Validate document against schema
    console.log("Validating document");
    console.log("Parsed document:", parsedDocument);
    console.log("Validating JSON Schema conformity:", collectionType.schema);
    const djv = Djv();
    djv.addSchema("test", collectionType.schema);
    const invalid = djv.validate("test", parsedDocument);

    if (invalid) {
      if (validationEnabled) {
        console.log("Document does not match schema:", invalid);
        return {
          success: false,
          type: "text",
          text: `Document does not match schema: ${JSON.stringify(invalid)}`,
        };
      } else {
        // Log warning but continue if validation is disabled
        console.warn(
          `[WARNING] Document validation failed for collection '${collection_name}': ${JSON.stringify(
            invalid
          )}`
        );
      }
    }

    console.log("Inserting document into collection");

    // Insert document into collection
    const ObjectId = await insertIntoCollection(
      collection_name,
      parsedDocument
    );

    // Check for large text fields and add suggestion
    const LARGE_TEXT_THRESHOLD = 500; // characters
    let hasLargeText = false;

    for (const [key, value] of Object.entries(parsedDocument)) {
      if (
        typeof value === "string" &&
        value.length > LARGE_TEXT_THRESHOLD &&
        !value.startsWith("#")
      ) {
        hasLargeText = true;
        break;
      }
    }

    return {
      success: true,
      type: "text",
      text: `Document was added to collection '${collection_name}'${
        !invalid && !validationEnabled
          ? " (validation warnings were ignored)"
          : ""
      }${hasLargeText ? ` (Tip: ${MARKDOWN_ENCOURAGEMENT})` : ""}`,
      object_id: ObjectId.toString(),
    };
  } catch (error) {
    console.log("Error adding document to collection:", error);
    return {
      success: false,
      type: "text",
      text: `Error adding document to collection: ${error}`,
    };
  }
}

export { addToCollection, addToCollectionSchema };
