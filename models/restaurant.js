const mongoose = require('mongoose');

const restaurantSchema = mongoose.Schema({
  name: String,
  address: String,
  coords: {
    latitude: Number,
    longitude: Number,
  },
  photo: String,
  price: Number,
  rating: Number,
  link: String,
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
