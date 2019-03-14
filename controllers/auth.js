const bcrypt = require('bcryptjs');

// crypto is a built-in lib in node.js (not third part lib);
// It will be used to ceate a token in password reset.
const crypto = require('crypto');

// import sendgrid with node mailer **************8

// created Third party mail server
const nodeMailer = require('nodemailer');

// provided sendgrid api server out of many mail apps registered for nodemailer
const sendgridTransport = require('nodemailer-sendgrid-transport');

// In router, we use check method and In controller, we use validationResult.
// Validation result collects all validation result executed by 'check()' method.
const { validationResult } = require('express-validator/check');


const { seng_grid } = require('../config/key');

// nodemailer encloses integrate / encloses sendgrid
const transporter = nodeMailer.createTransport(sendgridTransport({
    auth: {
        // api_user: ,
        api_key: seng_grid
    }
}));

//************************************************ */
const User = require('../models/user');

exports.getLogin = (req, res, next) => {

  let message = req.flash('error');
  message = message.length === 0 ? null : message[0];

  res.render('auth/login', {
    path: '/login',
    pageTitle: 'User Login',
    errorMessage: message,
    oldInput: { 
        email: '', 
        password: ''
    },
    validationErrors: []
  });
};

exports.getSignup = (req, res, next) => {

    let message = req.flash('error');
    message = message.length === 0 ? null : message[0];

    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message,
        oldInput: {
            email: '',
            password: '',
            confirmPassword: ''
        },
        validationErrors: []
        
    // isAuthenticated: false
    });
};

exports.postLogin = (req, res, next) => {

    // [My Solution - all functions iside of this callback]
    // const errors = validationResult(req);

    // if(!errors.isEmpty()) {

    //     return res.status(422).render('auth/login', {
    //         path: '/login',
    //         pageTitle: 'User Login',
    //         errorMessage: errors.array()[0].msg
    //     });
    // }
    
    // User.findOne({ email: req.body.email })
    //     .then(user => {
    //         req.session.isAuthenticated = true;
    //         req.session.user = user;
    //         req.session.save(err => {
    //             res.redirect('/');
    //         }); 
    //     })
    //     .catch(e => console.error(e));

    // [Max's solution - all functions iside of this callback]

    const { email, password } = req.body;

    const errors = validationResult(req);

    // for validation error of letter like min: 4, special charater??
    if(!errors.isEmpty()) {

        return res.status(422).render('auth/login', {
            path: '/login',
            pageTitle: 'User Login',
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array()

        });
    }
    
    User.findOne({ email })
        .then(user => {
            if(!user) {

                // 2)
                return res.status(422).render('auth/login', {
                    path: '/login',
                    pageTitle: 'User Login',
                    errorMessage: 'Invalid email',
                    oldInput: { email, password },
                    validationErrors: [{ param: 'email'}]
        
                });
                
                // must be spotted over res.redirect******************
                // to send message in res.redirect() **********************
                // req.flash('error', 'Invalid email');
                // return res.redirect('/login'); 
            }
            // return boolean
            bcrypt.compare(password, user.password)
                .then(isMatched => {
                    // ************ here we can initilize session!!!!!
                    if(isMatched) { 
                        req.session.isAuthenticated = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            res.redirect('/');
                        });
                    
                    }

                    return res.status(422).render('auth/login', {
                        path: '/login',
                        pageTitle: 'User Login',
                        errorMessage: 'Invalid password',
                        oldInput: { email, password },
                        validationErrors: [{ param: 'password' }]
            
                    });


                    // must be spotted res.redirect******************
                    // req.flash('error', 'Invalid password');

                    // // isMatched === false
                    // res.redirect('/login');
                    
                })
                .catch(e => { 
                    // we can setup redirect in catch block.
                    res.redirect('/login');
                    throw new Error('Unable to log you in!.');
                });
            
        })

};

exports.postSignup = (req, res, next) => {
    const { email, password, confirmPassword } = req.body;

    // validationResults will retrieve all errors 
    //  which is verified by check() on "req"
    const errors = validationResult(req);

    // if errors are available
    if(!errors.isEmpty()) {

        // need to get Invalid value
        // [ { location: 'body',
        //     param: 'email',
        //     value: 'test',
        //     msg: 'Invalid value' } ] // message can be customized at the check() stip
        // console.log(errors.array())

        // validation error code: 422
        // show the same rendering with signup
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pageTitle: 'Signup',

            // use a component of express-validation here
            // because it has own error message methods.

            // Down below, we have another error message tool name flash
            // But it should be used in a different way.
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password, confirmPassword },
            validationErrors: errors.array()
        });
    }

    // Error control here about the duplicated email
    //  should be logically spotted in validation!
    // Find it at route.js
    // User.findOne({ email })
    //     .then(user => {
    //         // Therefore
    //         if(user) {
    //             // must be spotted at upperline of res.redirect
    //             req.flash('error', 'Email exists arleady.');
    //             return res.redirect('/signup');
    //         }
            
        bcrypt.hash(password, 12)
            .then(hashedPassword => {

                    const newUser = new User({
                        email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
        
                    return newUser.save();
        
            })
            .then(() => {

                // 2) to show error message, just in case
                res.redirect('/login');

                // Adding sending confirmation email
                // async
                return transporter.sendMail({
                    // setup receiver
                    to: email, // signup user
                    from: 'shop@node-complete.com',
                    subject: 'Signup succeeded!',
                    html: '<h1>You successfully signed up</h1>'

                })
                .catch(err =>{
      
                    let message;
                    const errors = new Error(message || err);
                    errors.httpStatusCode = 500;
                    return next(errors);    
                });
                // .catch(e => { throw new Error('Failed to send email!'); });
                
                // It is ok, btw. ***************************************888
                // However, it is really important
                //  that because of async, the user should wait 
                //  for callback invoked and executed.
                // It can have the performance lagged.
                // So if the functions are not associated with
                //  a certain order, it should be in the last process / step.

                
                // transporter.sendMail({
                //     // setup receiver
                //     to: email, // signup user
                //     from: 'shop@node-complete.com',
                //     subject: 'Signup succeeded!',
                //     html: '<h1>You successfully signed up</h1>'

                // })
                // res.redirect('/login');
            
            })
            .catch(err =>{
      
                let message;
                const errors = new Error(message || err);
                errors.httpStatusCode = 500;
                return next(errors);    
            });
            // .catch(e => {
            //     throw new Error('The email already exists.');
            // });

        
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

// token!!!
exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if(message.length === 0) {
        message = null;
    } else {
        message = message[0];
    }
    res.render('auth/reset', {
        path: '/reset',
        pageTitle: 'Reset Password',
        errorMessage: message
    });
}

// it is for password reset button
exports.postReset = (req, res, next) => {
    // randomBytes: creating encrypted token
    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect('/reset');
        }
        // get token from buffer which is return value of randomBytes
        // *******************************************************************8
        // The reason token is required is because loggein user
        //      is able to get 'reset' page by using url.
        // Then, they can get to password update page without email verification
        //  and token verification. Only the user get email and token verification
        //  can change the password.!!!

        const token = buffer.toString('hex');
        // from email form
        User.findOne({ email: req.body.email })
            .then(user => {
                if(!user) {
                    req.flash('error', 'No account with that email.');
                    return res.redirect('/reset');
                }
                user.resetToken = token;
                // 360000 (+ an hour) : the token is expired within an hour.
                //  Therefore, the user must renew the password in an hour.
                user.resetTokenExpiry = Date.now() + 3600000;
                user.save()
                    .then(() => {

                        res.redirect('/');
        
                        transporter.sendMail({
                            // setup receiver
                            to: req.body.email,
                            from: 'shop@node-complete.com',
                            subject: 'Password Reset',
                            html: `
                                <p>You requested a password reset.</p>
                                <p>Click this <a href="http://localhost:3000/reset/${token}">link.</a> to set a new password.</p>`
        
                        });
                    })
                    .catch(err =>{
      
                        let message;
                        const errors = new Error(message || err);
                        errors.httpStatusCode = 500;
                        return next(errors);    
                    });
                    // .catch(e => { throw new Error('Unable to reset your password reset token.'); });

            })
            
    });
}

exports.getNewPassword = (req, res, next) => {
    // verifying the resetToken is available.
    const { token } = req.params;

    // { $gt: Date.now() } : restTokenExpiry is greater than now (if expiry date is in the future)
    //  because the token controls the user must renew password in a limited period of time.
    //      when the token is created.
    User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if(message.length === 0) {
                message = null;
            } else {
                message = message[0];
            }
            res.render('auth/new-password', {
                path: 'new-password',
                pageTitle: 'New Password',
                errorMessage: message,
                passwordToken: token,
                // in order to find the user when the user renews the password.
                userId: user._id.toString()
            });

        })
        .catch(err =>{
      
            let message;
            const errors = new Error(message || err);
            errors.httpStatusCode = 500;
            return next(errors);    
        });
        // .catch(e =>{ throw new Error('You are not allowed to reset the password.'); });

}

exports.postNewPassword = (req, res, next) => {
    // userId is hidden, by the way.
    const { password, userId, passwordToken } = req.body;
    let resettingUser;

    User.findOne({ 
        _id: userId, 
        resetToken: passwordToken,
        resetTokenExpiry: { $gt: Date.now() }
    })
    .then(user => {
        if(!user) {
            req.flash('error', 'No account with that give token.');
            return res.redirect('/login');
        }
        resettingUser = user;
        return bcrypt.hash(password, 12);
    })
    .then(newPassword => {
        resettingUser.password = newPassword;
        
        // remove the schema fields ***************************************
        // "undefine!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
        resettingUser.resetToken = undefined;
        resettingUser.resetTokenExpiry = undefined;
        return resettingUser.save();
    })
    .then(() => {
        res.redirect('/login');
    })
    .catch(err =>{
        let message;
        const errors = new Error(message || err);
        errors.httpStatusCode = 500;
        return next(errors);    
    });
    // .catch(e => { throw new Error('Unable to find the user with that given token.'); });    

}