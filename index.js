const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
        // https://foreign-language-server-pi.vercel.app/users
        app.get('/users', async (req, res) => {
            const result = await usersCollection.find().toArray();
            res.send(result);
        })

        // user update: add new field [roll: 'admin']
        // ManageUsers.jsx [handelMakeAdmin function]
        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updateUser = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateUser);
            res.send(result)
        })

        // delete user from ManageUsers.jsx [admin can delete]
        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await usersCollection.deleteOne(query);
            res.send(result)
        })

        // display users info in server
        // https://foreign-language-server-pi.vercel.app/slider
        app.get('/slider', async (req, res) => {
            const result = await sliderCollection.find().toArray();
            res.send(result);
        })

        // display courses info in server
        // https://foreign-language-server-pi.vercel.app/courses
        app.get('/courses', async (req, res) => {
            const result = await coursesCollection.find().toArray();
            res.send(result);
        })

        // display instructor info in server
        // https://foreign-language-server-pi.vercel.app/instructor
        app.get('/instructor', async (req, res) => {
            const result = await instructorCollection.find().toArray();
            res.send(result);
        })

        // display reviews info in server
        // https://foreign-language-server-pi.vercel.app/reviews
        app.get('/reviews', async (req, res) => {
            const result = await reviewsCollection.find().toArray();
            res.send(result);
        })

        // create new collection by user favorite data
        // https://foreign-language-server-pi.vercel.app/favorite
        app.post('/favorite', async (req, res) => {
            const item = req.body;
            const result = await favoriteCollection.insertOne(item);
            res.send(result)
        })

        // display user specific data in My Favorite
        // https://foreign-language-server-pi.vercel.app/favorite?email=vselfnet@gmail.com
        app.get('/favorite', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([])
            }
            const query = { email: email };
            const result = await favoriteCollection.find(query).toArray();
            res.send(result);
        })

        // delete item from Favorite.jsx [user can delete]
        app.delete('/favorite/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await favoriteCollection.deleteOne(query);
            res.send(result)
        })

        // create new collection by user enroll data
        // https://foreign-language-server-pi.vercel.app/enroll
        app.post('/enroll', async (req, res) => {
            const item = req.body;
            const result = await enrollCollection.insertOne(item);
            res.send(result)
        })

        // display user specific data in enroll classes
        // https://foreign-language-server-pi.vercel.app/enroll?email=haqueflora@gmail.com
        app.get('/enroll', async (req, res) => {
            const email = req.query.email;
            if (!email) {
                res.send([])
            }
            const query = { email: email };
            const result = await enrollCollection.find(query).toArray();
            res.send(result);
        })

        // delete item from Enroll.jsx [user can delete]
        app.delete('/enroll/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await enrollCollection.deleteOne(query);
            res.send(result)
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