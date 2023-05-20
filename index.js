const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;

// middleware
// app.use(cors());
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"], // Add PATCH to the allowed methods
  })
);
app.use(express.json());

// mongoDB

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster.sarczah.mongodb.net/?retryWrites=true&w=majority`;

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
    const toyCollection = client.db("toyDB").collection("allToys");
    const blogsCollection = client.db("blogsDB").collection("blogs")

    // get blogs from db
    app.get('/blogs', async(req,res)=> {
      const result = await blogsCollection.find().toArray();
      res.send(result)
    })

    // post toys to db
    app.post("/toys", async (req, res) => {
      const toys = req.body;
      console.log(toys);
      const result = await toyCollection.insertOne(toys);
      res.send(result);
    });

    // get all toys from db
    app.get("/toys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });

    // get single toys from db
    app.get("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const toy = await toyCollection.findOne(query);
      res.send(toy);
    });

    // get toys by category from db
    app.get("/category", async (req, res) => {
      let query = {};
      if (req.query?.subCategory) {
        console.log("ok")
        query = { subCategory: req.query.subCategory };
      }
      console.log(query)
      const result = await toyCollection.find(query).limit(2).toArray();
      res.send(result);
    });

    // load some toys defend on user
    app.get("/myToys", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await toyCollection.find(query).toArray();
      res.send(result);
    });

    // update single data
    app.patch("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const updatedToy = req.body;
      console.log(updatedToy);
      const filter = { _id: new ObjectId(id) };
      const newUpdatedUser = {
        $set: {
          price: updatedToy.price,
          quantity: updatedToy.quantity,
          description: updatedToy.description,
        },
      };
      const result = await toyCollection.updateOne(filter, newUpdatedUser);
      res.send(result);
    });

    // delete single data
    app.delete("/toys/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.log);

// basic route
app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`app is running on port: ${port}`);
});
