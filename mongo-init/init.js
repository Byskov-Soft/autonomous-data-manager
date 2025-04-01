// This script will be executed when the MongoDB container starts for the first time

// Connect to MongoDB with admin credentials
db = db.getSiblingDB('admin');
db.auth('admin', 'admin');

// Create application database
db = db.getSiblingDB('assistant');

// Create a user for the application database
db.createUser({
  user: 'admin',
  pwd: 'admin',
  roles: [
    { role: 'readWrite', db: 'assistant' },
    { role: 'dbAdmin', db: 'assistant' }
  ]
});

// Create the resources collection
db.createCollection('resources');

// Create indexes for the resources collection
db.resources.createIndex({ "id": 1 }, { unique: true });
db.resources.createIndex({ "collection_name": 1 }, { unique: true });


print("MongoDB initialization completed successfully");