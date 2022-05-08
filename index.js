const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ message: "Unauthorized Access" });
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

    // post authoraizition
    app.post("/singin", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    //get all books
    app.get("/books", async (req, res) => {
      const query = {};
      const cursor = booksCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get all my item
    app.get("/my-book/:email", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.params.email;
      if (email === decodedEmail) {
        const query = { email };
        const cursor = booksCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //get pegination item
    app.get("/book-list", async (req, res) => {
      const page = parseInt(req.query.page);
      const limit = parseInt(req.query.limit);
      const query = {};
      const cursor = booksCollection.find(query);
      const result = await cursor
        .skip(page * limit)
        .limit(limit)
        .toArray();
      res.send(result);
    });

    // get book count
    app.get("/book-count", async (req, res) => {
      const count = await booksCollection.estimatedDocumentCount();
      res.send({ count });
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

    //Delete book

    app.delete("/remove-book/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await booksCollection.deleteOne(query);
      res.send({ success: true, message: "Book Delete Success!" });
    });

    // put update book info

    app.put("/update-book/:id", async (req, res) => {
      const id = req.params.id;
      const updateBook = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateBook.name,
          price: updateBook.price,
          image: updateBook.image,
          Stock: updateBook.Stock,
          SupplierName: updateBook.SupplierName,
          description: updateBook.description,
        },
      };
      const result = await booksCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send({ success: true, message: "Update Success!" });
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
