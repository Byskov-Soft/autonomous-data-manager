import { createCollectionType } from "../../persistence/persistCollectionType.js";
import { CollectionType } from "../../models/entities.js";
import { ToolInputParams, ToolReturnParams } from "../../models/types.js";
import { formDataToJson } from "../../utils.js";

const COLLECTION_TYPE_TOOL_DESCRIPTION = [
  "Add a collection type to the database. This allows the AI to define a collection",
  "(using a schema), that will be automatically created, and perform CRUD operations",
  "on that collection.",
].join(" ");

const COLLECTION_TYPE_PARAM_DESCRIPTION = [
  "Add a collection type to the database with a defined schema.",
  "The 'collection' parameter must be a JSON string (not an object)",
  "containing the collection definition with:",
  "id, name, collection_name, description, and schema properties.",
  "The schema property should follow JSON Schema format with type, properties, and required fields.",
  'Example: {"collection": "{"id":"products","name":"Products","collection_name":"products",',
  '"schema":{"type":"object","properties":{"id":{"type":"string"},"name":{"type":"string"},',
  '"summary":{"type":"string"}},"required":["id","name","summary"]}}}',
].join(" ");

const COLLECTION_TYPE_EXAMPLE_RECORD = `
{
  "id": "products",
  "name": "Products",
  "collection_name": "products",
  "description": "Store product information",
  "schema": {
    "type": "object",
    "properties": {
      "id": { "type": "string" },
      "summary": {
        "type": "string",
        "description": "A concise description of the topic and conclusion"
      },
      "name": { "type": "string" },
      "price": { "type": "number" },
      "description": { "type": "string" },
      "inStock": { "type": "boolean" }
    },
    "required": ["id", "name", "price", "summary"]
  }
}
`;

/* Example record matching the collection type schema
{
  "id": "prod-12345",
  "name": "Wireless Headphones",
  "summary": "High-end wireless headphones with excellent battery life and noise cancellation",
  "price": 99.99,
  "description": "Premium noise-cancelling wireless headphones with 30-hour battery life",
  "inStock": true
}
*/

const addCollectionTypeSchema = {
  name: "add_collection_type",
  description: COLLECTION_TYPE_TOOL_DESCRIPTION,
  inputSchema: {
    type: "object",
    properties: {
      collection: {
        type: "string",
        description: COLLECTION_TYPE_PARAM_DESCRIPTION,
        examples: [COLLECTION_TYPE_EXAMPLE_RECORD],
      },
    },
    required: ["collection"],
  },
};

/**
 * Tool function to add a new collection to the database
 * This function is used with the CallToolRequestSchema MCP handler
 *
 * @param collectionData - JSON string containing the collection data
 * @returns Object with success message and created collection details
 */
async function addCollectionType(
  params: ToolInputParams
): Promise<ToolReturnParams> {
  console.log("Adding collection type:", params);

  const { collection } = params.arguments ?? {};

  if (!collection || typeof collection !== "string") {
    console.log("Invalid collection data:", collection);
    return {
      success: false,
      type: "text",
      text: "'collection' must be present in the request params arguments",
    };
  }

  try {
    console.log("Parsing collection data:", collection);
    const jsonCollection = formDataToJson(collection);

    console.log("JSON parsed collection data:", jsonCollection);

    // Add validation for required summary field in schema
    if (!jsonCollection.schema?.properties?.summary) {
      return {
        success: false,
        type: "text",
        text: "Schema must include a 'summary' field of type string",
      };
    }

    if (!jsonCollection.schema.required?.includes("summary")) {
      return {
        success: false,
        type: "text",
        text: "The 'summary' field must be included in the required fields array",
      };
    }

    const parsedData = CollectionType.parse(jsonCollection);
    console.log("ZOD Parsed collection data:", parsedData);

    const newCollection: Omit<CollectionType, "created_at" | "updated_at"> = {
      id: parsedData.id,
      name: parsedData.name,
      collection_name: parsedData.collection_name,
      description: parsedData.description || "",
      schema: parsedData.schema,
    };

    console.log("Creating collection type:", newCollection);
    // Create the resource entity in the database
    await createCollectionType(newCollection);

    return {
      success: true,
      type: "text",
      text: `Collection '${newCollection.name}' was added`,
    };
  } catch (error) {
    console.log("Error adding collection:", (error as Error).message);
    return {
      success: false,
      type: "text",
      text: `Error adding collection: ${error}`,
    };
  }
}

export { addCollectionType, addCollectionTypeSchema };
