const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mlivg.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const booksCollection = client.db("booksZone").collection("books");

    //get all books
    app.get("/books", async (req, res) => {
      const query = {};
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get single book
    app.get("/book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await booksCollection.findOne(query);
      res.send(result);
    });

    // put delivery book

    app.put("/delivery-book/:id", async (req, res) => {
      const id = req.params.id;
      const updateDelivery = req.body;
      const filter = { _id: ObjectId(id) };
      console.log(filter);
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          Stock: updateDelivery.Stock,
        },
      };
      const result = await booksCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send({ success: true, message: "Delivered Success!" });
    });

    // put stock book

    app.put("/stock-book/:id", async (req, res) => {
      const id = req.params.id;
      const updateDelivery = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          Stock: updateDelivery.Stock,
        },
      };
      const result = await booksCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send({ success: true, message: "Stock Success!" });
    });

    // post add book

    app.post("/add-book", async (req, res) => {
      const book = req.body;
      const result = await booksCollection.insertOne(book);
      res.send({ success: true, message: "book add Success!" });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// root server
app.get("/", (req, res) => {
  res.send("Books Zone Server is Running!");
});

app.listen(port, () => {
  console.log(`This server is running port is: ${port}`);
});
