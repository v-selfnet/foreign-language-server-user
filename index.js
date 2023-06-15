const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER)

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
        const coursesCollection = client.db('summerCampDB').collection('courses');
        const instructorCollection = client.db('summerCampDB').collection('instructor');
        const reviewsCollection = client.db('summerCampDB').collection('reviews');
        const favoriteCollection = client.db('summerCampDB').collection('favorite');
        const enrollCollection = client.db('summerCampDB').collection('enroll');

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

        // display logged user in dashboard
        // app.get('/users/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) };
        //     const result = await usersCollection.findOne(query);
        //     res.send(result)
        // })

        // display users info in server
        // http://localhost:5000/slider
        app.get('/slider', async (req, res) => {
            const result = await sliderCollection.find().toArray();
            res.send(result);
        })

        // display courses info in server
        // http://localhost:5000/courses
        app.get('/courses', async (req, res) => {
            const result = await coursesCollection.find().toArray();
            res.send(result);
        })

        // display instructor info in server
        // http://localhost:5000/instructor
        app.get('/instructor', async (req, res) => {
            const result = await instructorCollection.find().toArray();
            res.send(result);
        })

        // display reviews info in server
        // http://localhost:5000/reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        // create new collection by user favorite data
        // http://localhost:5000/favorite
        app.post('/favorite', async (req, res) => {
            const item = req.body;
            const result = await favoriteCollection.insertOne(item);
            res.send(result)
        })

        // display all users favorite info in server
        // http://localhost:5000/favorite
        // app.get('/favorite', async (req, res) => {
        //     const result = await favoriteCollection.find().toArray();
        //     res.send(result);
        // })

        // display user specific data in My Favorite
        // http://localhost:5000/favorite?email=vselfnet@gmail.com
        app.get('/favorite', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([])
            }
            const query = { email: email };
            const result = await favoriteCollection.find(query).toArray();
            res.send(result);
        })

        // create new collection by user enroll data
        // http://localhost:5000/enroll
        app.post('/enroll', async (req, res) => {
            const item = req.body;
            const result = await enrollCollection.insertOne(item);
            res.send(result)
        })

        // display user specific data in enroll classes
        // http://localhost:5000/enroll?email=haqueflora@gmail.com
        app.get('/enroll', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([])
            }
            const query = { email: email };
            const result = await enrollCollection.find(query).toArray();
            res.send(result);
        })


        // ping to DB
        await client.db("admin").command({ ping: 1 });
        console.log("Multi Tounge Summer Camp Server successfully connected to MongoDB!");
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