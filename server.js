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

app.use('/api/restaurants', (req, res) => {
  // parse parameters from query
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;
  const radius = +req.query.radius;

  console.log('Incoming API request: ' + latitude, longitude, radius);

  // search database for Result matching criteria
  Result.findOne({
    latitude,
    longitude,
    radius,
  })
    .then((result) => {
      if (result) {
        // found matching result in database, send to user
        console.log('Retrieving result from database');
        res.status(200).json(result.restaurants);
      } else {
        // no matching result found in database, query Google Maps API
        console.log('Fetching result from API');
        googleMaps.placesNearby(
          {
            language: 'en',
            location: [latitude, longitude],
            radius: radius,
            type: 'restaurant',
            opennow: true,
          },
          (err, response) => {
            Promise.all(
              response.json.results.map(async (result) => {
                const coords = {
                  latitude: +result.geometry.location.lat,
                  longitude: +result.geometry.location.lng,
                };

                const photo = await getPhoto(result);
                const source = photo
                  ? 'https://' + photo.req.socket._host + photo.req.path
                  : 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b';

                return new Restaurant({
                  name: result.name,
                  address: result.vicinity,
                  coords: coords,
                  photo: source,
                  price: result.price_level ? +result.price_level : 0,
                  rating: +result.rating,
                  link:
                    'https://www.google.com/maps/search/?api=1&query=' +
                    result.vicinity +
                    '&query_place_id=' +
                    result.place_id,
                });
              })
            ).then((restaurants) => {
              // create new Result object
              const result = Result({
                restaurants,
                latitude,
                longitude,
                radius,
              });
              // save result in database
              result.save();
              // send result to user
              res.status(200).json(restaurants);
            });
          }
        );
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

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
