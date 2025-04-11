const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config()

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xch7i.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const foodCollections = client.db("Food-Collection").collection("food");

        app.post("/foods", async (req, res) => {
            const food = req.body;
            const result = await foodCollections.insertOne(food);
            res.send(result);
        })
        app.get("/foods", async (req, res) => {
            const userEmail = req.query?.email;
            let query = {}
            if (userEmail) {
                query = { email: userEmail }
            }
            const result = foodCollections.find(query).toArray();
            res.send(result);
        })

    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send('Food share verver is running.....')
})
app.listen(port, () => {
    console.log(`food share server is running on port: ${port}`)
})











