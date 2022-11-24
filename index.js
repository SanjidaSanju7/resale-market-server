const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle wares

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Resale market server is running')
});

app.listen(port, () => {
    console.log(`Resale market server is running on ${port}`);
})