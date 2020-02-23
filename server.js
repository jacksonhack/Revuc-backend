const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const plantRoutes = express.Router();
const PORT = process.env.PORT;
var ReadWriteLock = require('rwlock');
 
var lock = new ReadWriteLock();

let Plant = require('./plants.model');

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true });
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

plantRoutes.route('/rainfall/:rainfall').get(function(req, res){

    rainfall = req.params.rainfall;
    Plant.find({plant_rainfall:rainfall}, function(err,plants){
        res.json(plants);
    });
});

plantRoutes.route('/name/:name').get(function(req, res){
    name = req.params.name;
    Plant.find({plant_name:name}, function(err, plants){
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

plantRoutes.route('/delete/:id').post(async function(req, res) {
    lock.writeLock(async function(release){
        await Plant.findOneAndDelete({_id:req.params.id});
        res.status(200).send();
        release();
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
            plants.plant_image = req.body.plant_image;
            plants.plant_desc = req.body.plant_desc;

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