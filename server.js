const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const plantRoutes = express.Router();
const PORT = 4000;

let Plant = require('./plants.model');

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://127.0.0.1:27017/plants', { useNewUrlParser: true });
const connection = mongoose.connection;


connection.once('open', function() {
    console.log("MongoDB database connection established successfully");
})

plantRoutes.route('/').get(function(req, res) {
    Plant.find(function(err, plants) {
        if (err) {
            console.log(err);
        } else {
            res.json(plants);
        }
    });
});

plantRoutes.route('/:id').get(function(req, res) {
    let id = req.params.id;
    Plant.findById(id, function(err, plants) {
        res.json(plants);
    });
});

plantRoutes.route('/hardiness/:hardiness').get(function(req, res) {
    hardiness = req.params.hardiness;
    Plant.find({plant_hardiness:hardiness}, function(err, plants){
        res.json(plants);
    });
});

plantRoutes.route('/temp/:temp').get(function(req,res){
    temp = req.params.temp;
    Plant.find({plant_low:{$lte: temp}, plant_hi:{$gte: temp}}, function(err, plants){
        res.json(plants);
    });

});

plantRoutes.route('/add').post(function(req, res) {
    let plants = new Plant(req.body);
    plants.save()
        .then(plants => {
            res.status(200).json({'plants': 'plant added successfully'});
        })
        .catch(err => {
            res.status(400).send('adding new plant failed');
        });
});

plantRoutes.route('/update/:id').post(function(req, res) {
    Plant.findById(req.params.id, function(err, plants) {
        if (!plants)
            res.status(404).send('data is not found');
        else
            plants.plant_name = req.body.plant_name;
            plants.plant_hardiness = req.body.plant_hardiness;
            plants.plant_rainfall = req.body.plant_rainfall;
            plants.plant_hi = req.body.plant_hi;
            plants.plant_low = req.body.plant_low;

            plants.save().then(plants => {
                res.json('Plant updated');
            })
            .catch(err => {
                res.status(400).send("Update not possible");
            });
    });
});

app.use('/plants', plantRoutes);

app.listen(PORT, function() {
    console.log("Server is running on Port: " + PORT);
});