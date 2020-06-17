const express = require('express');
const app = express();
const path = require('path');
const flash = require('connect-flash');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs')
const session = require('express-session');
const passport = require('passport');
let MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const User = require('./model/User');

require('dotenv').config();
require('./lib/passport');

const port = process.env.PORT || 3000

mongoose
        .connect(process.env.MONGODB_URI, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                    useCreateIndex: true
        })
        .then(() => {
            console.log('Mongodb Connected')
        })
        .catch(err => console.log(`Mongo error: ${err}`));

        
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
        
app.use(express.json());
app.use(express.urlencoded(
        { extended: false }
));

app.use(morgan('dev'));
app.use(cookieParser()); // has to be first
app.use(session({ //after cookieParser
    resave: false,
    saveUninitialized: false,
    useCreateIndex: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        mongooseConnection: mongoose.connection,
        autoReconnect: true
    }),
    cookie: {
        secure: false,
        maxAge: 1000 * 60 *60 * 24
    }
}))

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    console.log('Session', req.session);
    console.log('User', req.user);
    next();
})

app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.errors = req.flash('errors');
    res.locals.success = req.flash('success');
    next()
})



app.get('/', (req, res) => {
    // res.render('index')
    User.find()
    .then((users) => {
        return res.status(200).json(users);
    })
    .catch((err) => err);
});

// const auth = (req ,res, next) => {
//     if(req.isAuthenticated()) {
//         next();

//     } else {
//         return res.send('You are not authorized to view this page')
//     }
// }

app.get('/logged',(req, res) => {
    // if(req.isAuthenticated()) {
        
        
    // } else {
    //     return res.send('You are not authorized to view this page')
    // }
    res.render('logged');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/thankyou', (req, res) => {
    res.render('thankyou');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.get('/bootstrap', (req, res) => {
    res.render('bootstrap');
})

app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/logged',
    failureRedirect: '/login',
    failureFlash: true
})
)


app.post('/register', (req, res) => {
    User.findOne( { email: req.body.email }).then((user) => {
        if(user) {
            res.status(400).json({ message: 'User Exists'});
            req.flash('error', 'Account exists');
            return res.redirect(301, '/register');
        } else {
            const newUser = new User();
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);

            newUser.name = req.body.name;
            newUser.email = req.body.email;
            newUser.password = hash;

            newUser.save().then((user) => {
                req.login(user, (err) => {
                    if(err) {
                        res.status(500).json({ confirmation: false, message: 'Server Error'});
                    } else {
                        res.redirect('/thankyou');
                    }
                });
            })
            .catch((error) => console.log(error));
        }
    })
})

app.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('/bootstrap');
})

// app.get('/flash', (req, res) => {
//     res.render('flash', { message: req.flash('info') });
// });

// app.get('/single-flash', (req, res) => {
//     req.flash('info', 'Hi Single Flash');
//     res.redirect('/flash');
// });

// app.get('/multiple-flash', (req, res) => {
//     req.flash('info', ['Welcome', 'Flash Array Worked'])
// })

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
// app.use((req, res, next) => {
//     let cookieVariable = req.cookies.cookieName;
//     if(cookieVariable === undefined) {
//         let randomId = uuid();
//         res
//                     .cookie('cookieName', randomId, { maxAge: 5000, httpOnly: true });
//     } else {
//         res
//                     .send(`Cookie already exists ${cookieVariable}`);
//     }
    
//     next();
// })



// app.get('/', (req, res) => {
//     req.session.name = 'BK'

//     if(req.session.numViews) {
//         req.session.numViews++
//     } else {
//         req.session.numViews = 1
//     }

//     return res.send(`Hi ${req.session.name}. You have views this page ${req.session.numViews} times`)
// });

// app.get('/cookie', (req, res) => {
//     console.log(req.cookies);

//     let options = {
//         maxAge: 2000,
//         httpOnly: true,
//         signed: true
//     }

    //set cookie
//     res.cookie('cookieName', 'pliablelink', options);
//     res.send('Cookies and Sessions')
// });


// mongoose, dotenv, express, cookie-parser, morgan






////Original Homework with apis here below

// const express = require('express');
// const app = express();
// const path = require('path');
// const morgan = require('morgan');
// require('dotenv').config();

// const movieRoutes = require('./routes/movieRoutes');
// const randomUser = require('./routes/randomRoutes');
// const port = process.env.PORT || 8080;

// app.use(express.static(path.join(__dirname, 'public')));

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// app.use(morgan('dev'));

// app.use('/', movieRoutes, randomUser); //parent route using both different routes files





//     app.listen(port, () => {
//       console.log(`Listening on port ${port}`)
// });