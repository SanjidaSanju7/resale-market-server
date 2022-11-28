const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle wares

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q5qwa13.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

// jwt function

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}



async function run() {
    try {

        const categoriesCollection = client.db('resaleMarket').collection('categories');
        const productsCollection = client.db('resaleMarket').collection('products');
        const bookingsCollection = client.db('resaleMarket').collection('bookings');
        const usersCollection = client.db('resaleMarket').collection('users');
        const myProductsCollection = client.db('resaleMarket').collection('myproducts');

        const verifyAdmin = async (req, res, next) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            next();
        }


        // all categories
        app.get('/categories', async (req, res) => {
            const query = {}
            const cursor = categoriesCollection.find(query);
            const category = await cursor.toArray();
            res.send(category);
        });

        app.get('/categories/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const categories = await categoriesCollection.findOne(query);
            res.send(categories);
        });


        //get all products
        app.get('/products', async (req, res) => {
            const query = {}
            const cursor = productsCollection.find(query);
            const product = await cursor.toArray();
            res.send(product);
        });

        //  products by id

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { category_id: id }
            const products = await productsCollection.find(query).toArray();
            res.send(products);
        });

        // add a product
        app.post('/myproducts', async (req, res) => {
            const myproduct = req.body;
            const result = await myProductsCollection.insertOne(myproduct);
            res.send(result);
        });

        app.get('/productCategory', async (req, res) => {
            const query = {};
            const result = await categoriesCollection.find(query).project({ categoryName: 1 }).toArray();
            res.send(result)
        });

        // get my product

        app.get('/myproducts', async (req, res) => {
            const query = {}
            const cursor = myProductsCollection.find(query);
            const myproduct = await cursor.toArray();
            res.send(myproduct);

        })

        // my products query
        app.get('/myproducts', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const myproducts = await myProductsCollection.find(query).toArray();
            res.send(myproducts)
        });

        // delete my products api

        app.get('/myproducts/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const result = await myProductsCollection.deleteOne(filter);
            res.send(result)
        })


        // bookings

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result)
        });

        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings)
        });

        // jwt 
        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '7d' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accsessToken: '' })
        });

        // users admin route
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' });
        });

        // users seller route
        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' });
        })

        // all users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result)
        });

        app.get('/users', async (req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)
        });

        app.put('/users/verified/:id', verifyJWT, verifyAdmin, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);
            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'forbidden access' })
            }
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: "verified"
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result)
        })




    }
    finally {

    }
}

run().catch(err => console.error(err))




app.get('/', (req, res) => {
    res.send('Resale market server is running')
});

app.listen(port, () => {
    console.log(`Resale market server is running on ${port}`);
})