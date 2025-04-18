export enum SERVER_MODE {
  SSE = 'sse',
  STDIO = 'stdio'
}

export enum COLLECTIONS {
  COLLECTION_TYPES = 'collection_types'
}

export enum RESOURCE_NAME {
  SERVER_DESCRIPTION = 'server-description',
  COLLECTIONS = 'collections'
}

export enum TOOL_NAME {
  ADD_COLLECTION_TYPE = 'add_collection_type',
  ADD_TO_COLLECTION = 'add_to_collection',
  ADD_BATCH_TO_COLLECTION = 'add_batch_to_collection',
  DELETE_FROM_COLLECTION = 'delete_from_collection',
  GET_FROM_COLLECTION = 'get_from_collection',
  GET_COLLECTION_SUMMARY = 'collection_summary',
  GET_RESOURCE_DATA = 'get_resource_data'
}
