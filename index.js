const express = require("express");
const app = express();
const port = process.env.PORT || 5000;

// root server
app.get("/", (req, res) => {
  res.send("Books Zone Server is Running!");
});

app.listen(port, () => {
  console.log(`This server is running port is: ${port}`);
});
