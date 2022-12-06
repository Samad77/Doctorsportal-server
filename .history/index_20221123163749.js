const express = require("express");
const app = express();
const cors = require("cors");
require("colors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
// const { query } = require("express");
const jwt = require("jsonwebtoken")
const port = process.env.PORT || 6000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send(`Server is running on port ${port}`)
});

const varifyJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send("Unauthorized Token")
    }

    const token = authHeader;
    console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message: "Forbidden access "
            })
        }

        req.decoded = decoded;
        next()
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bhnyzm5.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {

        await client.connect();

        const appoinmentCollection = client.db("Doctors-Portal").collection("AppoinmentOption");
        const bookingsCollection = client.db('Doctors-Portal').collection("Bookings");
        const Registered = client.db("Doctors-Portal").collection("Registered-User")


        app.get('/appoinmentOption', async (req, res) => {
            const query = {};
            const date = req.query.date;
            console.log(date);
            const result = await appoinmentCollection.find(query).toArray();
            const bookingQuery = { appoinmentDate: date };
            const alreadyBooked = await bookingsCollection.find(bookingQuery).toArray();

            result.forEach(option => {
                const optionBooked = alreadyBooked.filter(booked => booked.treatment === option.name);
                console.log(optionBooked);
                const bookedSlot = optionBooked.map(book => book.slot);
                const remainingSlots = option.slots.filter(slot => !bookedSlot.includes(slot))
                option.slots = remainingSlots;
            })
            res.send(result)
        });

        app.get('/bookings', varifyJWT, async (req, res) => {
            const email = req.query.email;

            const query = {
                email: email
            }
            // console.log(req.headers.authorization);
            const result = await bookingsCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = {
                email: email
            };

            const user = await Registered.findOne(query);
            console.log(query, user);
            if (user?.email) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
                return res.send({
                    status: "Success",
                    Token: token
                })
            }

            res.status(403).send({
                accessToke: ""
            })
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await Registered.insertOne(user);
            res.send(result);
        });

        app.get('/users',  async (req, res) => {
            const query = {};
            const result = await Registered.find(query).toArray();
            res.send(result)
        })

        app.put('/users/admin/:id', varifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = {email : decodedEmail};
            const user = await Registered.findOne(query);
            console.log("clicked",uery)
            if(user?.role !== "admin"){
                return res.status(403).send("forbidden access")
            }
            const userId = req.params.id;
            console.log(userId);
            const filter = { _id: ObjectId(userId) };
            const option = { upsert: true };
            const updatedDoc = {
                $set : {
                    role : "admin"
                }
            }

            const result = await Registered.updateOne(filter, updatedDoc, option);
            res.send(result)
        });

        app.get('/users/admin/:email', async(req, res) => {
            const email = req.params.email;
            const query = {
                email : email
            };
            
            const user = await Registered.findOne(query);
            console.log(email, user)
            res.send({isAdmin : user?.role === "admin"});
            
        })
        app.post('/bookings', async (req, res) => {
            const bookings = req.body;
            console.log(bookings);
            const bookingDateQuery = {
                appoinmentDate: bookings.appoinmentDate,
                email: bookings.email,
                treatment: bookings.treatment
            }

            const count = await bookingsCollection.find(bookingDateQuery).toArray();
            if (count.length > 1) {
                const message = `You already booked`;
                return res.send({
                    acknowledged: false, message: message
                })
            }
            const result = await bookingsCollection.insertOne(bookings);
            res.send(result)
        })
    } finally {

    }
}
run().catch(err => console.error(err))



app.listen(port, () => {
    console.log(`Server is running on port ${port}`.red.bold);
})