until mongo --host mongo --eval "print(\"waited for connection\")"
do
    sleep 1
done

mongo --host mongo --eval "db.createCollection('hackernews');"
mongo --host mongo --eval "db.getCollection('hackernews').createIndex({ 'created_at_i': 1 }, { 'unique': true });"