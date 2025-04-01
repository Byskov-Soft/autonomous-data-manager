export MONGO_URI=mongodb://localhost:27017
export MONGO_DB_NAME=assistant
export MONGO_USER=admin
export MONGO_PASSWORD=admin
export COLLECTION_VALIDATION=on
export SSE_MODE_PORT=3001
export SSE_MODE_HOST=localhost
export RUN_MODE=command

cd "path to directory containing this file"
./node_modules/.bin/tsx src/index.ts

