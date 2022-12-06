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



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bhnyzm5.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async() => {
    try{
        await client.connect();
        const appoinmentCollection = client.db("Doctors-Portal").collection("AppoinmentOption");
        appoinmentCollection.insertOne({name : 'Abdus Samad'})
    }finally{

    }
}
run().catch(err => console.error(err))



app.listen(port, () => {
    console.log(`Server is running on port ${port}`.red.bold);
})