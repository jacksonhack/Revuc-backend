const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let Plant = new Schema({
    plant_name: {
        type: String
    },
    plant_hardiness: {
        type: Number
    },
    plant_rainfall: {
        type: String
    },
    plant_hi: {
        type: Number
    },
    plant_low: {
        type: Number
    }
});

module.exports = mongoose.model('Plant', Plant);