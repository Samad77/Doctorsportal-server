const express = require("express");
const app = express();
const cors = require("cors");
require("colors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`Server is running on port ${port}`)
});



const uri = "mongodb+srv://<username>:<password>@cluster0.bhnyzm5.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



app.listen(port, () => {
    console.log(`Server is running on port ${port}`.red.bold);
})