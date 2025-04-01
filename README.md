# AI Autonomous Data Manager

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