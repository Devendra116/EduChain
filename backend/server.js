const express = require('express')
require('dotenv').config()
const port = process.env.PORT || 5000;
const connectDB = require('./config/db')


const app = express()

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



app.listen(process.env.PORT, () =>
    connectDB()
        .then(() => console.log(`Server is up and running at http://localhost:${process.env.PORT}`))
        .catch(() =>
            console.log('Server is running , but database connection failed')
        )
);
