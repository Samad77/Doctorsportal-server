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
        const bookingsCollection = client.db('Doctors-Portal').collection("Bookings")

        app.get('/appoinmentOption', async(req, res) => {
            const query = {};
            const date = req.query.date;
            console.log(date);
            const result = await appoinmentCollection.find(query).toArray();
            const bookingQuery = {appoinmentDate : date};
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

            result.forEach( option => {
                const optionBooked = alreadyBooked.filter( booked => booked.treatment === option.name);
                console.log(optionBooked)
            })
            res.send(result)
        });

        app.post('/bookings', async(req, res) => {
            const bookings = req.body;
            console.log(bookings);
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result)
        })
    }finally{

    }
}
run().catch(err => console.error(err))



app.listen(port, () => {
    console.log(`Server is running on port ${port}`.red.bold);
})