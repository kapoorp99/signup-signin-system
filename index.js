const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config();
const config = require('./config/config').get(process.env.NODE_ENV)
const userRoutes = require('./routes/users.route')

const db_options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 40000,
    family: 4
};


mongoose.Promise = global.Promise;
mongoose.connect(config.DATABASE, db_options)
    .then(() => {
        console.log('Connected to database successfully')
    })
    .catch((error) => {
        console.error('Could not connect to database', error)
    })

const app = express()

app.use(helmet())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors())
app.use(morgan('combined'))

app.get('/', (req, res) => {
    res.send("Hello World")
});

app.use(`/api/v1/users`, userRoutes)

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});
