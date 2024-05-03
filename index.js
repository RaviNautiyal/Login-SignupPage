const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./Models/user.js');
// const User = require('./Models/user');

// We can emit the js extension as Node.js is resolving it internally
const app = express();

// middlewares

app.use(express.urlencoded({ extended: true }));
// This middleware helps in parsing the data to req.body object  and now we can use the data sent in the form using res.body.field_name
app.use(session({
    secret: '--indianarmy--',
    resave: false,
    saveUninitialized: false
}));
app.use(express.static('Public'))

app.set('view engine', 'ejs');
// Connect to MongoDB and also handling errors if occurred
mongoose.connect('mongodb://127.0.0.1:27017/WEB_DEV', {
   
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDBc:', err));

//Routes


app.get('/signup', (req, res) => {
    res.render('signup');
});


app.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        });
        await user.save();
        
        req.session.signupSuccess = true;
        res.redirect('/index.html');


    } catch (error) {
        console.error('Error signing up:', error);
        res.redirect('/signup');
    }
});
app.get('/sessionData', (req, res) => {
    res.json({ signupSuccess: req.session.signupSuccess });
  });
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        console.log("User not found")
        return res.redirect('/login');
    }
        
    try {
        if ( bcrypt.compare(req.body.password, user.password)) {
            req.session.user = user; 
            // Setting the user session
            res.redirect('/home');
        } else {
            console.log("Invalid password")
            res.redirect('/login');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.redirect('/login');
    }
});
app.get('/home', (req, res) => {
    const username = req.session.user ? req.session.user.username : null;
    res.render('home', { name: username });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

const port=3000
const localhost='127.0.0.1'
app.listen(port, localhost, () => {
    console.log(`Server is running on http://${localhost}:${port}`);
});
