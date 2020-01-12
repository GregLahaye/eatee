const mongoose = require('mongoose');

const resultSchema = mongoose.Schema({
  date: { type: Date, default: Date.now },
  restaurants: Array,
  latitude: Number,
  longitude: Number,
  radius: Number,
});

module.exports = mongoose.model('Result', resultSchema);
