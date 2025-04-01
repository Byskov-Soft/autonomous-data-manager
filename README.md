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

**Note:** Running in SSE mode seems to cause some issues. While it works for the MCP Inspector tool, using it with Cursor or Cline may cause it to crash.

To run in Cursor in stdio mode do the following:

- Modify `run.sh` to set the correct path

- Start MongoDB using `docker-compose up` or use your own Mongo instance

- If using your own instance, remember to change exported `MONGO_*` environment variables in `run.sh` accordingly

- Add this entry to `mpc.json` (see Cursor MCP settings):

   ```json
    {
        "mcpServers": {
            "data_service": {
                // Use same path as mentioned above
                "command": "/<path>/run.sh",
                "args": []
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

Details to be added later
