# hackernews

![Node.js CI](https://github.com/radocode/hackernews/workflows/Node.js%20CI/badge.svg)

Hello!

This is a basic pug + express site that fetches data from a Hacker News API and inserts it into your local MongoDB (default port) server.
Then, you can browse it as a list and even navigate to the article. Even delete it by clicking on its respective row delete button.
New data will be fetched every hour, as long as the app is running!

Run Instructions (requires NPM and Node.js)):

First, run 

npm install 

To install all dependencies.

And to test the site, run:

SET DEBUG=hackernews:* & npm start

and navigate to http://localhost:3000

-----------------

To force a data insertion, just navigate to:

http://localhost:3000/insertNews


---------------

If you have Docker installed, or want to run this app in a Docker container, just run:

docker-compose up

It will automatically create all the containers needed (for node + mongodb) to run this app.

----------------

If you are running this locally:

You might want to import the database dump to your own local mongodb server, located over the DB folder, since it has the index it needs to avoid duplicate keys.

In case you only want to add the constraint, just run the following on the "hackernews" collection. Make sure there is no data on it first, or it will throw a constraint error!

db.getCollection("hackernews").createIndex({ "created_at_i": 1 }, { "unique": true })
