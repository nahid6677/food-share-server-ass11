const express = require('express');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
require("dotenv").config()

const port = process.env.PORT || 5000;

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const verifyToken = (req,res, next) =>{
    const token = req.cookies?.token;
    // console.log(token,"token")
    if(!token){
        return res.status(403).send({message: "Forbidden Assess"})
    }
    if(token){
        jwt.verify(token, process.env.JWT_SECRET, (err, decode) =>{
            if(err){
                // console.log(err)
                return res.status(401).send({message: "Unauthorized"})
            }
            console.log(decode, "decode")
            req.user = decode;
            next()
        })
    }
}


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

        app.post("/jwt", (req, res) => {
            const userEmail = req.body;
            // console.log(userEmail,"ddddddddd")
            if(!userEmail){
                return res.send({message : "user not found"})
            }
            const token = jwt.sign(userEmail, process.env.JWT_SECRET, { expiresIn: "30m" })
            res.cookie('token', token, {
                httpOnly: true,
                secure: false
            })
                .send({ message: true, logIn: true })
        })
        app.post("/logout", (req, res) => {
            res.clearCookie('token', {
                httpOnly: true,
                secure: false
            })
                .send({ message: true, logOut: true })
        })

        app.post("/foods", async (req, res) => {
            const food = req.body;
            const { expireDate, ...newFood } = food;
            newFood.date = new Date(expireDate)
            const result = await foodCollections.insertOne(newFood);
            res.send(result);
        })
        app.get("/foods", verifyToken, async (req, res) => {
            const userEmail = req.query?.email;
            const decodeEmail = req.user?.email;
            // console.log(userEmail, decodeEmail, "user and decode")
            if(userEmail !== decodeEmail){
                console.log("user and decode Mail is not ecqual")
                return res.status(403).send({message: "Forbidden Access"})
            }
            // let query = {}
            // if (userEmail) {
            //     query = { donerEmail: userEmail }
            // }
            const result = await foodCollections.find().toArray();
            res.send(result);
        })
        app.get("/managemyfood", async (req,res) =>{
            const userEmail = req.query.email;
            console.log(userEmail)
            let query = {};
            if(userEmail){
                query = {donerEmail: userEmail}
            }
            const result = await foodCollections.find(query).toArray()
            res.send(result);
        })
        app.get("/foods/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await foodCollections.findOne(query)
            res.send(result);
        })
        app.delete("/food/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await foodCollections.deleteOne(query);
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











