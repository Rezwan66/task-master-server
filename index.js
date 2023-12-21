const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zjzxbzp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );

    const tasksCollection = client.db('taskMasterDB').collection('tasks');

    app.get('/tasks', async (req, res) => {
      let queryObj = {};
      const emailQuery = req.query.email;
      if (emailQuery) {
        queryObj.email = emailQuery;
      }
      const result = await tasksCollection.find(queryObj).toArray();
      res.send(result);
    });
    app.post('/tasks', async (req, res) => {
      const newTask = req.body;
      const result = await tasksCollection.insertOne(newTask);
      res.send(result);
    });
    app.patch('/tasks/:id', async (req, res) => {
      const updatedCategory = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          category: updatedCategory,
        },
      };
      const result = await tasksCollection.updateOne(filter, updateDoc);
      res.send(result);
    });
    app.delete('/tasks/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await tasksCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// local
app.get('/', (req, res) => {
  res.send('Task Master is Running! 🏍');
});
app.listen(port, () => {
  console.log(`Task running on port: ${port}`);
});
