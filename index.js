const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vgnfmcl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        // create, connect DB & Collection
        const usersCollection = client.db('summerCampDB').collection('users');
        const sliderCollection = client.db('summerCampDB').collection('slider');

        // Register.jsx, SocialLogin.jsx store user info to DB
        app.post('/users', async (req, res) => {
            const user = req.body;
            // social login check user existent
            const query = { email: user.email };
            const existingUser = await usersCollection.findOne(query);
            if (existingUser) return;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        // display users info in server
        // http://localhost:5000/users
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })
        // display users info in server
        // http://localhost:5000/slider
        app.get('/slider', async (req, res) => {
            const result = await sliderCollection.find().toArray();
            res.send(result);
        })

        // ping to DB
        await client.db("admin").command({ ping: 1 });
        console.log("Multi Tounges Summer Camp Server successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Multi Tongue Summer Camp Server is Running...')
})

app.listen(port, () => {
    console.log(`Multi Tongue Summer Camp Server is Running on port: ${port}`)
})