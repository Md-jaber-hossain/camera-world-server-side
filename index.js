const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygxql.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// --------hiroku link----------//


async function run() {
    try {
        await client.connect();
        const database = client.db('cameraWorld');
        const servicesCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users');
        const reviewsCollection = database.collection('reviews');

        // -------------Product Services--------------//
        // GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // GET Single Service
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        // POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // DELETE API
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        });

        // ------------- Orders --------------///

        // GET API
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });


        // GET Single Service
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await ordersCollection.findOne(query);
            res.json(service);
        })

        // GET by email
        app.get('/myorders/:email', (req, res) => {
            console.log(req.params);
            ordersCollection
                .find({ email: req.params.email })
                .toArray((err, results) => {
                    res.send(results);
                });
        });

        // POST API
        app.post('/addOrders', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await ordersCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // DELETE API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        //UPDATE API
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id;
            const updatedService = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: updatedService.status
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options)
            console.log('updating', id)
            res.json(result)
        })

        // --------------Users-------------------

        // POST API
        app.post('/users', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await usersCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        app.put('/users', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });
        // Make Admin
        app.put("/makeAdmin", async (req, res) => {
            const filter = { email: req.body.email };
            const result = await usersCollection.find(filter).toArray();
            if (result) {
                const documents = await usersCollection.updateOne(filter, {
                    $set: { role: "admin" },
                });
                res.json(documents);
            }
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        // -----------------Reviews-----------------------

        // GET API
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // POST API
        app.post('/addReviews', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);

            const result = await reviewsCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Camera World Server');
});

app.listen(port, () => {
    console.log('Running Camera World Server on port', port);
})