"use strict";

const express = require('express');
const app = express();

const Sequelize = require('sequelize');
const mysql = require('mysql');
const _ = require('lodash');
const axios = require('axios');
const cheerio = require('cheerio');
const hbs = require("express-handlebars");
const bodyParser = require("body-parser");
const path = require('path');

const connection = new Sequelize('picrips','root','04051997');

const port = Number(process.env.PORT || 5000);

// MIDDLEWARE - BODY PARSER <-- Added Body Parser settings
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.text());
app.use(bodyParser.json({type:'application/vnd.api+json'}));

//MIDDLEWARE - HANDLEBARS! Folder and file extension customization.
app.engine('hbs', hbs({extname:'hbs', defaultLayout: 'main', layoutsDir: __dirname + '/views/layouts'}));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

const Picture = connection.define('picture', {
  title: {
    type:Sequelize.STRING,
    unique: true
  },
  url: {
    type: Sequelize.TEXT
  },
  origin: {
    type: Sequelize.TEXT
  },
  poster: {
    type: Sequelize.STRING
  },
  favorite: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
})

var source = ["earthporn", "villageporn","cityporn"];

var results = []

// set up a cheerio rip to rip the three reddits and store to MySQL.

_.each(source, (value, key) => {

  switch (key) {
    case 0:
      var redditPage = "https://www.reddit.com/r/Earthporn";
      break;
    case 1:
      var redditPage = "https://www.reddit.com/r/Villageporn";
      break;
    case 2:
      var redditPage = "https://www.reddit.com/r/Cityporn";
      break;
  }

  axios.get(redditPage)
    .then((response) => {

      var $ = cheerio.load(response.data);

      $('a.title').each(function(i, element) {
        var hit = {};

        hit.title = $(this).text();
        hit.origin = value;
        hit.poster = $(this).siblings('a.author').text();

        var thisLink = $(this).attr('href');

        //this limits only those links whose last 3 letters are JPG or PNG.
        if(thisLink.slice(-3) == "jpg" || thisLink.slice(-3) == 'png'){
          hit.url = thisLink;
          // console.log(result[i].url)

          // var results.value.i = result;

          console.log(hit);

          Picture.create({
            title: hit.title,
            url: hit.url,
            origin: hit.origin,
            poster: hit.poster
          });

          connection.sync({
            logging: console.log
          }).then((hit) => {
          results.push(hit);
            return results;
          }).catch((error) => {
            throw error;
          });
        }
    })
  })
});

app.get('/', (req, res) => {
  res.render('index',{
    date: Date.now(),
    name: "Matthew N. Martin"
  });
});


app.get('/earth', (req,res) => {
  Picture.findAll({
    where: {
      origin: "earthporn"
    }
  }).then((data) => {
    res.json(data);
  });
})

app.get('/village', (req,res) => {
  Picture.findAll({
    where: {
      origin: "villageporn"
    }
  }).then((data) => {
    res.json(data);
  })
})


app.get('/city', (req,res) => {
  Picture.findAll({
    where: {
      origin: "cityporn"
    }
  }).then((data) => {
    res.json(data);
  });
})

//EXPRESS - static files.
app.use('/public',express.static('public'));

app.listen(port, function() {
  console.log('Listening on port %s!', port);
});
