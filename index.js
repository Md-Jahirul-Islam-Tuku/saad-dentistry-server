const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.fqmp7pn.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: 'unauthorized access' });
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden access' });
    }
    req.decoded = decoded;
    next();
  })
}

async function run() {
  try {
    const Services = client.db("saadDentistry").collection("services");
    const Reviews = client.db('saadDentistry').collection('reviews');
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '40d' })
      res.send({ token })
    })
    app.get('/services', async (req, res) => {
      const query = {}
      const cursor = Services.find(query);
      const services = await cursor.toArray();
      res.send(services)
    })
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const service = await Services.findOne(query)
      res.send(service)
    })
    app.get('/reviews',verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: 'unauthorized access'})
      }
      let query = {}
      if (req.query.email) {
        query = {
          email: req.query.email
        };
      }
      const cursor = Reviews.find(query);
      const review = await cursor.toArray();
      res.send(review);
    })
    app.get('/review', async (req, res) => {
      let query = {}
      if (req.query.service) {
        query = {
          service: req.query.service
        };
      }
      const cursor = Reviews.find(query);
      const review = await cursor.toArray();
      res.send(review);
    })
    app.get('/reviews/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const review = await Reviews.findOne(query);
      res.send(review);
    })
    app.put('/reviews/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const user = req.body;
      const updatedDoc = {
        $set: {
          rating: user.ratingSub,
          text: user.textSub
        }
      }
      const updatedReview = await Reviews.updateOne(query, updatedDoc, options);
      res.send(updatedReview);
    })
    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await Services.insertOne(service);
      res.send(result)
    })
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await Reviews.insertOne(review);
      res.send(result);
    })
    app.delete('/reviews/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await Reviews.deleteOne(query);
      res.send(result);
    })

  } finally {

  }
}
run().catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('SaaD Dentistry server is running...')
})

app.listen(port, () => {
  console.log('SaaD Dentistry is listening on', port);
})