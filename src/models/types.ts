export enum COLLECTIONS {
  COLLECTION_TYPES = "collection_types",
}

export enum TOOL_NAME {
  ADD_COLLECTION_TYPE = "add_collection_type",
  ADD_TO_COLLECTION = "add_to_collection",
  GET_FROM_COLLECTION = "get_from_collection",
  DELETE_FROM_COLLECTION = "delete_from_collection",
  COLLECTION_SUMMARY = "collection_summary",
  GET_RESOURCE_DATA = "get_resource_data",
}

export interface ToolInputParams {
  name: string;
  arguments?: Record<string, unknown>;
}

export interface ToolReturnParams {
  [x: string]: unknown;
  type: "text";
  text: string;
}
