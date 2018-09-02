var MongoClient = require('mongodb').MongoClient;
var urlMongo = "mongodb://localhost:27017/hackernews";
var express = require('express');
var router = express.Router();
const dbName = 'hackernews';
const collectionName = 'hackernews';
const APIurl = "https://hn.algolia.com/api/v1/search_by_date?query=nodejs";
var Request = require("request");
var cron = require('cron');


var job = new cron.CronJob('0 0 1 0 0', function () {
  autoInsertion();
  console.log('running automatic insertion of news NOW');
}, null, true);

/* GET home page. */
router.get('/', function (req, res, next) {

  console.log('getting news from DB...');

  let resultArray = [];

  MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, db) {
    var dbo = db.db(dbName);
    var query = { deleted: false };
    var cursor = dbo.collection(collectionName).find(query).sort({created_at: -1});
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
      insertNews(JSON.parse(body));
      res.redirect('/');
    }
  });
});

/* POST deletes a specific article, updating its status to "deleted = true" */
router.get('/deleteArticle', function (req, res, next) {

  console.log('deleting news article from DB...');

  MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, db) {
    if (err) console.log(err);
    var dbo = db.db(dbName);
    console.log(req.query.id);
    var myquery = { objectID: req.query.id };
    var newvalues = { $set: { deleted: true } };

    dbo.collection(collectionName).updateOne(myquery, newvalues, function (err, res) {
      if (err) console.log(err);
      console.log("1 document updated, output: " + res);
      db.close();
    });
  });
  res.redirect('/');
});


function autoInsertion() {

  Request.get(APIurl, (error, response, body) => {
    if (error) {
      console.log(error);
    } else {
      insertNews(JSON.parse(body));
    }
  });
}

// inserts all the new articles
function insertNews(newsFromApi) {
  let news = newsFromApi;

  if (news && news.hits) {

    console.log('inserting news article to DB...');

    MongoClient.connect(urlMongo, { useNewUrlParser: true }, function (err, db) {
      if (err) console.log(err);
      var dbo = db.db(dbName);

      news.hits.forEach(element => {
        element.deleted = false;
        dbo.collection(collectionName).insertOne(element, { upsert: true }, function (err, res) {
          if (err) console.log(err);
        });
      });     

      db.close();
      console.log('Documents inserted: ' + news.hits.length);
    });
  }

}

module.exports = router;
