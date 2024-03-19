const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const session = require('express-session');
// import Router
const authRouter = require('./routes/authRouter');
const adminRouter = require('./routes/adminRouter');
const { JsonWebTokenError } = require('jsonwebtoken');

dotenv.config();
const app = express();

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGODB_URL);
const db = mongoose.connection;
db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to database'));

// middleware
app.use(express.urlencoded({extended:false}));
app.use(express.json());

app.use(session({
    secret: 'my secret key',
    saveUninitialized: true,
    resave: false,
}))

app.use((req, res, next) => {
    res.locals.message  = req.session.message;
    delete req.session.message;
    next();
})
app.use(cors());
app.use(cookieParser());
app.use(express.json());


app.set("view engine", "ejs");

//Routes
app.use("/v1/auth", authRouter);
app.use("", adminRouter);




app.listen(8000, ()=> {
    console.log('Server is running at http://localhost:8000');
});