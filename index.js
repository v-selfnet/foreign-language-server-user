const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 5000
require('dotenv').config();
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors());
app.use(express.json());

// verify token middleware
const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    console.log('verifyJWT auth:', authorization)
    if (!authorization) {
        return res.status(401).send({ error: true, messag: 'first: unauthorized access' })
    }
    const token = authorization.split(' ')[1];
    // console.log('verify token middleware', token);
    jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, messag: 'unauthorized access [after get token from client]' })
        }
        req.decoded = decoded;
        console.log('decode verifyJWT middleware: ', decoded);
        next();
    })
}

// console.log(process.env.SECRET_TOKEN)

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

        // server create JWT new token each hit
        // from AuthProvider.jsx
        // $ npm install jsonwebtoken
        app.post('/jwt', (req, res) => {
            // app.get('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: '1h' });
            // console.log(token);
            res.send({ token });
        })

        // warning: use verifyJWT before using verifyAdmin
        // middleware
        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ error: true, message: 'forbidden message from verrfyAdmin' });
            }
            next();
        }

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
        // from ManageUser.jsx only admin can access this link
        app.get('/users', verifyJWT, verifyAdmin, async (req, res) => {
            // app.get('/users', async (req, res) => {
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

        // check admin user or not
        // request from useAdmin.jsx
        app.get('/users/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            console.log('check admin:', email);
            if (req.decoded.email !== email) {
                console.log('send admin false')
                res.send({ admin: false })
            }
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            const result = { admin: user?.role === 'admin' }
            console.log('he is admin', result )
            res.send(result);
        })


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

        // delete item from Favorite.jsx [user can delete]
        app.delete('/favorite/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await favoriteCollection.deleteOne(query);
            res.send(result)
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