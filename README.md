# AI Autonomous Data Manager MCP

## About

The following text is what th AI sees when checking MCP server capabilities:

```
AI-powered data collection manager enabling autonomous data operations with dynamic schemas.

Key capabilities:

- Persist data across conversations
- Create and manage structured collections on-the-fly
- Perform CRUD operations with schema validation

Ideal for:

- Knowledge bases: Organize information from conversations
- Project tracking: Manage tasks, statuses, and deadlines
- Learning content: Track progress and generate quizzes

Best practice:

- Consider if current information might be valuable in future conversations - if unsure, ask the user about storing it.
```

## Getting started

- Make sure you have Node and NPM installed
  - Development was done using Node version 22.14.0, but other versions will probably work

- Run `npm install` to install dependencies

### Run in STDIO mode

- Copy `run-example.sh` to `run.sh` and set the correct path (to the repository directory)

- Start MongoDB using `docker-compose up` or use your own Mongo instance

   - If using your own instance, remember to change exported `MONGO_*` environment variables in `run.sh` accordingly

- Configure your editor/tool to use the MCP server

  Cursor editor example (`mpc.json`):

   ```json
    {
        "mcpServers": {
            "data_service": {
                // Same repository path as mentioned above
                "command": "/<path>/run.sh",
                "args": []
            }
        }
    }
    ```

### Run in SSE mode

**Note:** Running in SSE mode seems sketchy at times. While it works fine for the [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) tool. The server has sometimes crashed when Cursor or Cline was the client. So some improvements should be made to make SSE mode a bit sturdier.

- Start MongoDB using `docker-compose up` or use your own Mongo instance

   - If using your own instance, remember to change exported `MONGO_*` environment variables in `run.sh` accordingly


- Start the server: `npm start`

- Configure your editor/tool to use the MCP server

  Cursor editor example (`mpc.json`):

   ```json
    {
        "mcpServers": {
            "data_service": {
                "url": "http://localhost:3001/sse",
            }
        }
    }
    ```

## Available resources

- `data://server-description`

  Server Description: Description of the data service and its use cases. If you are an AI, fetch and read this first!

- `data://collections`

  Metadata about available collections (see schema attribute)

## Available tools

- add_collection_type
- add_to_collection
- get_from_collection
- delete_from_collection
- collection_summary
- get_resource_data

Details to be added later

