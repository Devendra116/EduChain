const express = require('express')
require('dotenv').config()
const port = process.env.PORT || 5000;
const connectDB = require('./config/db')
const cors = require('cors')


const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/user', require('./routes/user'))
app.use('/ngo', require('./routes/ngo'))
app.use('/course', require('./routes/course'))


app.listen(process.env.PORT, () =>
    connectDB()
        .then(() => console.log(`Server is up and running at http://localhost:${process.env.PORT}`))
        .catch(() =>
            console.log('Server is running , but database connection failed')
        )
);
