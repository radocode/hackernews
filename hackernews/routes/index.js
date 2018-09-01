var MongoClient = require('mongodb').MongoClient;
var urlMongo = "mongodb://localhost:27017/hackernews";
var express = require('express');
var router = express.Router();
const dbName = 'hackernews';
const collectionName = 'hackernews';
const APIurl = "https://hn.algolia.com/api/v1/search_by_date?query=nodejs";
var Request = require("request");


/* GET home page. */
router.get('/', function (req, res, next) {

  console.log('getting news from DB...');

  let resultArray = [];

  MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, db) {
    var dbo = db.db(dbName);
    var query = { deleted: false };
    var cursor = dbo.collection(collectionName).find(query);
    cursor.forEach(function (doc, err) {
      resultArray.push(doc);
    }, function () {
      db.close();
      res.render('index', { news: resultArray });
    });
  });
});

/* GET inserts all data from API origin to mongodb. */
router.get('/insertNews', function (req, res, next) {
  Request.get(APIurl, (error, response, body) => {
    if (error) {
      console.log(error);
    } else {
      res.send(insertNews(JSON.parse(body)));
    }
  });

});

/* POST deletes a specific article, updating its status to "deleted = true" */
router.get('/deleteArticle', function (req, res, next) {

  console.log('deleting news article from DB...');

  MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, db) {
    if (err) throw err;
    var dbo = db.db(dbName);
    console.log(req.query.id);
    var myquery = { objectID: req.query.id };        
    var newvalues = { $set: { deleted: true } };

    dbo.collection(collectionName).updateOne(myquery, newvalues, function (err, res) {
      if (err) throw err;
      console.log("1 document updated, output: " + res);
      db.close();
    });
  });
  res.redirect('/');
});

// inserts all the new articles
function insertNews(newsFromApi) {
  let news = newsFromApi;

  if (news && news.hits) {

    console.log('inserting news article to DB...');

    MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err;
      var dbo = db.db(dbName);

      news.hits.forEach(element => {
        // console.log(element);

        element.deleted = false;

        dbo.collection(collectionName).insertOne(element, { upsert: true }, function (err, res) {
          if (err) throw err;
          console.log("Number of documents inserted: " + res);
        });
      });
      db.close();
    });
  }

}

module.exports = router;
