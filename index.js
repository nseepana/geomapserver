
const express = require('express');
const bodyParser = require('body-parser');
const { mongoSET, geocodingAPI } = require('./config/dev')
const { MongoClient, ObjectID, ObjectId } = require('mongodb');
const path = require('path');
const app = express();
const mongoURI = mongoSET.split("#")[0];
const collectionName = mongoSET.split("#")[1];

app.use(bodyParser.json());
app.post('/api/add', (req, res) => {
    try {
        let query = req.body;
        //console.log(query);
        MongoClient.connect(mongoURI, { 'useNewUrlParser': true }, (err, client) => {
            if (err) throw err;
            let dbo = client.db();
            let oid = new ObjectID();
            let payload = { _id: oid, address: query.address, lat: query.lat, lng: query.lng };
            dbo.collection(collectionName).insertOne(payload, (err, result) => {
                if (!err) {
                    res.status(200).send({ "success": true, response: payload })
                } else {
                    res.status(500).send({ "success": false })
                }
                client.close();
            });
        })
    } catch (e) {
        //console.log(e);
    }
})



app.post('/api/update', (req, res) => {
    let query = req.body;
    MongoClient.connect(mongoURI, { 'useNewUrlParser': true }, (err, client) => {
        let dbo = client.db();
        dbo.collection(collectionName).updateOne({ _id: ObjectId(query._id) }, {
            $set: {
                address: query.address, lat: query.lat, lng: query.lng
            }
        }, (err, result) => {
            if (!err) {
                res.status(200).send({ "success": true, response: query })
            } else {
                res.status(500).send({ "success": false })
            }
            client.close();
        });
    });
})

app.post('/api/delete', (req, res) => {
    let query = req.body;
    MongoClient.connect(mongoURI, { 'useNewUrlParser': true }, (err, client) => {
        let dbo = client.db();
        dbo.collection(collectionName).deleteOne({ _id: ObjectId(query._id) }, (err, result) => {
            if (!err) {
                res.status(200).send({ "success": true })
            } else {
                res.status(500).send({ "success": false })
            }
            client.close();
        });
    });

})


app.get('/api/all', (req, res) => {
    MongoClient.connect(mongoURI, { 'useNewUrlParser': true }, (err, client) => {
        let dbo = client.db();
        dbo.collection(collectionName).find({}).toArray((err, result) => {
            if (!err) {
                res.status(200).send({ "success": true, response: result })
            } else {
                res.status(500).send({ "success": false })
            }
            client.close();
        });
    })
})
if (process.env.prod) {
    app.use(express.static('client/build'))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    })
}


const port = process.env.PORT || 5000;
app.listen(port);