const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// import express-session lib ***************************************8
const session = require('express-session');
const mongoStore = require('connect-mongodb-session')(session);

// to prevent csrf from the hacker 
//  using cookie information in the browser
//  when the sesion is still available.
const csrf = require('csurf');

// error handling or to deliver some variable or message in the pre req
//  to the next req 
const flash = require('connect-flash');

const { mongoKey } = require('./config/key' );
const { get404, get500 } = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const Mongo_URI = `mongodb+srv://joon:${mongoKey}@firstatlas-drwhc.mongodb.net/shop`;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/* 
  // When session data is created.... in mongodb

  _id: "Sr5H66Ieud9JLHhUmymKb51iABX_yg_i"
  expires: 2019-03-20T19:42:39.295+00:00
  session: Object
  cookie: Object {
    originalMaxAge: null
    expires: null
    secure: null
    httpOnly: true
    domain: null
    path: "/"
    sameSite: null
  }
  isAuthenticated: true ==>>> we set it up  // set up by us

*/

// create collection to store session data including cookie
const store = new mongoStore({
  uri: Mongo_URI,
  collection: 'sessions'
});

// configuration to initialize. 
// We can configure particulary about cookie
// but default session would be fine
const csrfProtection = csrf();

// resave:false : as long as session data is not switched,
//  it is not going to save the same cookie again.
// saveUninitialized: false: until the req requests the session to be saved,
//  it is not going to be saved.
// It sets up "req.session" field
app.use(session({secret: 'asfasdfsafdsa', resave: false, saveUninitialized: false, store }));

// must use after session.
//  because csrf protection key is created after the session is create.
// it sets up "req.csrfToken();"" like passport.js sets up req.ueser ****r
app.use(csrfProtection);

// It must come after the session.
// if we want to handle session message in connect-flash
// we need to put connect-flash at this spot.
// It sets up "req.flash()" for error message handling....
app.use(flash());

// moved to login routes
// app.use((req, res, next) => {
//   // if(req.session.isAuthenticated) {
//     User.findById('5c7ff22830149705b40657f0')
//       .then(user => {
//         req.user = user
//       });
//   //}
// });

// CSRF Token should be prior to the app.use('directory.')
// Therefore every req is executed , the following value will reach to view's render.
/* 

  [ csrf role ]
  The server gives a token to front-end, and the token is particularly assigned to the form.
  Therefor, whenever, req's event occurs, the server is able to recognize that
  the front end is right one to interact with.

  In this mechanism, the would be able to prevent csrf from fraud
    which is taking advantage of cookie information it their (hacker's) fron end.

*/
app.use((req, res, next) => {
  // locals: it is built in method express
  // to make variables and deliver variable value to local 'views'
  // It is able to deliver the value to all view components without 'res.render()'.
  // Then, it is often used to deliver common value.

  // in the views if isAuthenticated and and csrfToken variables exist,
  //  they dirctly receive the values from req.session.isAuthenticated
  //  and req.csrfToken

  res.locals.isAuthenticated = req.session.isAuthenticated;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Bear in mind again!!!
// Here app.use executes every single time
//  the request comes in!!!
app.use((req, res, next) => {

  // [ Error Handling in app's callback ]
  // It generates the looping errors.

  // because... it is sames as the one below.
  // .catch(e => {
    //  const error = new Error('message')
    // return next(error);
  //}

  // the issue caused by "throw ne Error" is that
  //  "res.redirect()" in app.use((error, res, res, next) => {}) below
  //  is a new request. Thefore, this app.use((req, res, next)) executes
  //  again and then goes to app.use(err, res, req, next) over and over
  //  and finally generates the unlimited loopring error. 
  
  //  Also, when it reaches out to app.use(error, req, res, nes)
  //  we need "csrfToken" to be run ahead because "500.ejs" file has
  //  <%- include('includes/navigation.ejs') %>
  //  and <%- include('includes/navigation.ejs') %> has 
  //  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  
  // Both are same.
  // as long as app.use(error, req, res, next) exists
  //  and then when the error is "thrown"
  //  app.use((error, req, res, next) => {}) will take them!!!

  // throw new Error('Another Crazy Error');
  // next(new Error('Another Crazy Error'));

  // 2)
  // For more accurate error check
  if(!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(user => {

      // [ Error Handling in Promise ]
      // Whevever clicks the client requst
      //  this error is generated.

      // However, this error does not reach out to
      //  app.use(error, req, res, next => {}) down below.
      //  Why?
      // catch statement "in this chain" catches the eror 
      //  and then stops the function
      // It is mainly because it is Promise!!!!!
      // throw new Error('Crazy Error!')

      // more secure
      if(!user) {
        return next();
      }

      req.user = user;
      next();

    })
    .catch(e => {

      // 3) ****************************************88
      // however we can reach out to the outside promise handling
      // by utilizing next()
      // as we did in the controllers.!!!!!
      // like 
      
      // const erorr = new Error(e);
      // error.statusCode = 500;
      // return next(error);

      next(new Error(e));
      
      throw new Error(e);
      
      // 2)
      // more benefit with "throw new Error(e)""...
      // It throws the real technical and operational error.
      // We can easily find what the error is.

      // *************************************888
      // Just bear in mind that throw new Error will terminate the function.!
      // However, the error handling inside of Promise 
      // throw new Error(e);
      
      // 1)
      // console.log(e)
        
    });

  // 1)
  // // main reason req.session.user is necessary!
  // if(req.session.user) {

  //   // We can get req.session.user._id only when user logged in 
  //   //  stores the session data in db.
  //   //  Therefore, req.session.isAuthenticated is not working here.
  //     User.findById(req.session.user._id)
  //       .then(user => {
  //         req.user = user;
  //         next();
  //       })
  //       .catch(err => console.log(err));
  // } else {
  //   next();
  // }
  
});

// // Therefore every req is executed , the following value will reach to view's render.
// app.use((req, res, next) => {
//   // locals: it is built in method express
//   // to make variables and deliver variable value to local 'views'
//   // It is able to deliver the value to all view components without 'res.render()'.
//   // Then, it is often used to deliver common value.

//   // in the views if isAuthenticated and and csrfToken variables exist,
//   //  they dirctly receive the values from req.session.isAuthenticated
//   //  and req.csrfToken

//   res.locals.isAuthenticated = req.session.isAuthenticated;
//   // must be prior to ejs file
//   res.locals.csrfToken = req.csrfToken();
//   next();
// });


// ************************************** Whenever any routes "throw new error"
//  it takes the error!!!! except that the promise callback error without next()
// It is a special middleware only to handle 500 error.
// Not deal with 404 error.
// We can centralize the error message like the one followed,
//  even under the line of "app.use(get404)" when the error is thrown
//  in each request.
app.use((error, req, res, next) => {
  
  // 2) to avoid the unlimited looping issue.
  res.status(500).render('500', { 
    pageTitle: 'Server Error', 
    path: '/500',
    isAuthenticated: req.session.isAuthenticated 
  });
  
  // 1) Issue: "redirect" can generate the unlimited looping error 
  //  as specified in app.use(req, res, next)
  // console.log('test another creazy error!')
  // res.redirect('/get500');
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// It must be here even though the app.use((error, req. res, next) => {})
app.get('/get500', get500);
app.use(get404);

mongoose
  .connect(Mongo_URI, { useNewUrlParser: true })
  .then(() => {
    console.log('Server is up!');
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
