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


async function run() {
    try {

        const categoriesCollection = client.db('resaleMarket').collection('categories');
        const productsCollection = client.db('resaleMarket').collection('products');


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
        })

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