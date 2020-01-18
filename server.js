const express = require('express');
const mongoose = require('mongoose');

const Restaurant = require('./models/restaurant');
const Result = require('./models/result');

const app = express();

// connect to MongoDB database
mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.log('Connection to database failed');
    console.log(error);
  });

// set express config
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// listen on port
const port = process.env.PORT || '80';
app.listen(port, () => {
  console.log('server running on port ' + port);
});

// set static folder
const dist = __dirname + '/dist/eatee/';
app.use(express.static(dist));

// set CORS header
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Header',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  next();
});

app.use('/api/restaurants', async (req, res) => {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const radius = +req.query.radius;

  const result = await Result.findOne({
    latitude,
    longitude,
    radius,
  });

  if (result) {
    // found matching result in database, send to user
    console.log('Retrieving result from database');
    res.status(200).json(result.restaurants);
  } else {
    // didn't find matching result in database, fetch from api
    console.log('Fetching from API');

    let result = await f(latitude, longitude, radius);
    let restaurants = result.restaurants;
    let pagetoken = result.pagetoken;

    // fetch more pages
    while (pagetoken) {
      result = await f(pagetoken);
      restaurants = restaurants.concat(result.restaurants);
      pagetoken = result.pagetoken;
    }

    res.json(restaurants);

    // save result to database
    Result({
      restaurants,
      latitude,
      longitude,
      radius,
    }).save();
  }
});

async function f(a, b, c) {
  let params;
  if (arguments.length === 3) {
    params = {
      language: 'en',
      location: [a, b],
      radius: c,
      type: 'restaurant',
      opennow: true,
    };
  } else {
    params = {
      pagetoken: a,
    };
  }

  const response = await googleMaps.placesNearby(params).asPromise();
  const restaurants = await Promise.all(
    response.json.results.map(async (result) => {
      return await g(result);
    })
  );
  const pagetoken = response.json.next_page_token;
  return { restaurants, pagetoken };
}

async function g(result) {
  const coords = {
    latitude: +result.geometry.location.lat,
    longitude: +result.geometry.location.lng,
  };

  const photo = await getPhoto(result);
  const source = photo
    ? 'https://' + photo.req.socket._host + photo.req.path
    : 'assets/not-found.jpg';

  return new Restaurant({
    name: result.name,
    address: result.vicinity,
    coords: coords,
    photo: source,
    price: 0,
    rating: +result.rating,
    link:
      'https://www.google.com/maps/search/?api=1&query=' +
      result.vicinity +
      '&query_place_id=' +
      result.place_id,
  });
}

function getPhoto(restaurant) {
  if ('photos' in restaurant) {
    return googleMaps
      .placesPhoto({
        photoreference: restaurant.photos[0].photo_reference,
        maxwidth: 1000,
      })
      .asPromise();
  }
}

const googleMaps = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise,
});

module.exports = app;
