import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  CallToolResult,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ReadResourceResult,
} from "@modelcontextprotocol/sdk/types.js";
import express from "express";
import {
  TOOL_NAME,
  ToolInputParams,
  ToolReturnParams,
} from "./models/types.js";
import { getEnv } from "./service/env.js";
import {
  getServerDescription,
  listResources,
  readCollectionsInfo,
} from "./service/resources.js";
import {
  addCollectionType,
  addCollectionTypeSchema,
  addToCollection,
  addToCollectionSchema,
  deleteFromCollection,
  deleteFromCollectionSchema,
  getFromCollection,
  getFromCollectionSchema,
  getCollectionSummarySchema,
  getCollectionSummary,
} from "./service/tools/index.js";
import { randomUUID } from "crypto";

// Get environment variables
const env = getEnv();

// Initialize server with resource capabilities
const server = new Server(
  {
    name: "ai-autonomous-data-manager",
    version: "1.0.0",
    description:
      "Data collection manager for persisting and organizing information across conversations." +
      "Consider saving useful information for future reference.",
  },
  {
    capabilities: {
      resources: {}, // Enable resources
      tools: {}, // Enable tools
    },
  }
);

// Resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return listResources();
});

server.setRequestHandler(
  ReadResourceRequestSchema,
  async (request): Promise<ReadResourceResult> => {
    switch (request.params.uri) {
      case "data://server-description":
        console.log("Server description requested");
        return getServerDescription();

      case "data://collections":
        console.log("Collections info requested");
        return readCollectionsInfo();

      default:
        console.log("Resource not found");
        return { contents: [] };
    }
  }
);

// Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      addCollectionTypeSchema,
      addToCollectionSchema,
      getFromCollectionSchema,
      deleteFromCollectionSchema,
      getCollectionSummarySchema,
    ],
  };
});

server.setRequestHandler(
  CallToolRequestSchema,
  async (request): Promise<CallToolResult> => {
    console.log("CallToolRequestSchema", request);

    let handler: (input: ToolInputParams) => Promise<ToolReturnParams>;

    switch (request.params.name) {
      case TOOL_NAME.ADD_COLLECTION_TYPE:
        handler = addCollectionType;
        break;

      case TOOL_NAME.ADD_TO_COLLECTION:
        handler = addToCollection;
        break;

      case TOOL_NAME.GET_FROM_COLLECTION:
        handler = getFromCollection;
        break;

      case TOOL_NAME.DELETE_FROM_COLLECTION:
        handler = deleteFromCollection;
        break;

      case TOOL_NAME.COLLECTION_SUMMARY:
        handler = getCollectionSummary;
        break;

      default:
        throw new Error("Tool not found");
    }

    return { content: [await handler(request.params)] };
  }
);

// Start server using appropriate transport based on RUN_MODE
if (env.RUN_MODE === "sse") {
  console.log(`Starting server in SSE mode`);

  const app = express();
  const activeTransports: { [sessionId: string]: SSEServerTransport } = {};

  app.get("/sse", async (req, res) => {
    console.log("SSE Request received");
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const transport = new SSEServerTransport("/messages", res);
    const sessionId = transport.sessionId;
    activeTransports[sessionId] = transport;

    await server.connect(transport);

    res.on("close", () => {
      console.log(`SSE Client ${sessionId} disconnected`);
      delete activeTransports[sessionId];
    });
  });

  app.post("/messages", (req, res) => {
    console.log(`/message Request received`);
    const sessionId = req.query.sessionId as string; // Extract from query
    console.log(`Session ID: ${sessionId}`);
    const transport = activeTransports[sessionId];

    if (transport) {
      transport.handlePostMessage(req, res);
    } else {
      res
        .status(404)
        .json({ error: "No active SSE connection for this session" });
    }
  });

  app.listen(env.SSE_MODE_PORT, env.SSE_MODE_HOST, () => {
    console.log(
      `Server is running on http://${env.SSE_MODE_HOST}:${env.SSE_MODE_PORT}`
    );
  });
} else {
  console.log("Starting server in commandline (stdio) mode");
  const transport = new StdioServerTransport();
  server.connect(transport);
}
