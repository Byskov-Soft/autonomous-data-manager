today=$(date +%Y-%m-%d-%H%M%S)
mongodump -u admin -p admin -d assistant --authenticationDatabase admin -o MongoBackup/${today}
