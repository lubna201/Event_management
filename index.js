const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload');
require('dotenv').config();

const port = process.env.PORT || 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());
app.use(express.static('admin'));
app.get('/', (req, res) => {
  res.send('Hello World!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9kigp.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const eventCollection = client.db("eventSL").collection("eventSL");
  const adminCollection = client.db("eventSL").collection("admin");
  const commentCollection = client.db("eventSL").collection("comments");
  console.log("database connected");
  app.get('/services', (req, res) => {
    eventCollection.find()
      .toArray((err, items) => {
        res.send(items)
      })
  })

  app.get('/services/:id', (req, res) => {
    eventCollection.find({ id: req.params._id })
      .toArray((err, items) => {
        res.send(items)
      })
  })

  app.post('/addServices', (req, res) => {
    const newEvent = req.body;
    console.log('adding new event', newEvent);
    eventCollection.insertOne(newEvent)
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0);
      })

  })
  app.delete('/deleteService/:name', (req, res) => {
    const name = ObjectID(req.params.name);
    console.log('delete this', name);
    eventCollection.findOneAndDelete({ name: name })
      .then(documents => res.send(!!documents.value))
  })

  app.post('/addAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({ email })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

  app.get('/admins', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admins) => {
        res.send(admins.length > 0);
      })
  });

  app.get('/comments', (req, res) => {
    commentCollection.find({})
      .toArray((err, items) => {
        res.send(items)
      })
  })

  app.post('/addComments', (req, res) => {
    const newEvent = req.body;
    console.log('adding new event', newEvent);
    commentCollection.insertOne(newEvent)
      .then(result => {
        console.log('inserted count', result.insertedCount);
        res.send(result.insertedCount > 0);
      })

  });
})

  app.listen(port)