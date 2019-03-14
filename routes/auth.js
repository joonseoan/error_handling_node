const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// need to imort 3rd party package and its check directory.
// check package has all the validation tools we want to add.

// body: please see the body object in req!!!!
//      Therefore it can check...all fields of req.body
const { check, body } = require('express-validator/check');

const {
    
    getLogin,
    postLogin,
    postLogout,
    postSignup,
    getSignup,
    getReset,
    postReset,
    getNewPassword,
    postNewPassword

} = require('../controllers/auth');

const User = require('../models/user');

router.get('/login', getLogin);

router.get('/signup', getSignup);

router.get('/reset', getReset);

router.get('/reset/:token', getNewPassword);

/* 
    Error Control : using another web page itself
    Validation : using message in the webpage
*/

// Adding express-validator
// "check" funtion will return a middleware.

// check('input name') of form in the views.
//  It goes to this controller
//  withMessage() [Optional] : we can customize the error message over here.
//  It shows up only when the error occurs.
router.post('/signup',
    // We can chain more validation tools like the way below.!!!!
    // Please use official exprexx-validator doc!!!
    // []: multiple check!!!: it is using es6 function ([a, b])
    [ 
        check('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        // sanitizing the user input.
        // for instance, it changes the upper letter into the lower case
        .normalizeEmail()
        // sanitiziang...
        .trim()

        // customize by using callback and javascript error message.
        // It only returns true or false (boolean value) **********************************
        .custom((value, {req}) => {
            
            // 2)
            // return here: it is for custom!!!!! *******************************
            // The "custom function { }" has its own catch statement.
            //  Therefore, when we have an Promise.reject() or throw new Error()
            //  custom function's catch statement executed and then it is assigned to msg field. 
            // We do not need to specify catch statement here.!!!!!!
            return User.findOne({ email: value })
            // just bear in mind that "then" always implictly declairs Promise.
            .then(user => {
                // Therefore
                if(user) {
                   
                    
                    // Promise.reject vs throw new Error(') : No difference "as long as" using Promise Async function!!
                    // For the error control in this Promise environment, it always needs its own .catch(e => {})
                    // In other words, .catch((e) => {}) is placed at the right spot because
                    //  no promise asyc such as timeout() needs another different "catch" statement.!!
                    
                    // Again, as long as we use "then" as a callback, we can use Promise.reject() or throw new Error();
                    // When "throw new Error()" [throw new Error() is executed in any other functions, though] executes, 
                    //  that async callback function is terminated except that "try catch" are used in the sycn function. ********************88
                    
                    // However, on the othe hand, when we use Promise.reject() or Promise.resolve(), the function is not terminated.
                    // Eventually, the function is terminated only in catch statement (btw, normally, in async "catch" is the last statement)

                    // return Promise.reject()
                    // console.log('reached here') // working...
                    // ).catch(e => {console.log('stop here')})

                    // throw new Error('aaa') 
                    // console.log('unable to reach here') // not working
                    
                    // The reason we use Promise.reject is because we need to explicitly use "return" *********************8
                    //  to get back to custom(). Implicitly throw new Error() works, though. 
                    
                    // The ones down below are working in same way!!!
                    return Promise.reject('The email exists already.');  //  ====> false
                    // throw new Error('eddddddddddddddd'); // working....
                }
                

            // return true; not necessary because "return User.findOne..... above" **********

            // 1) to block a specific email account name/address

            // // when we do not allow the specific email address
            // if(value === 'test@test.com')
            // throw  new Error('This email address is forbidden.');

            // // if the email address is not test@test.com
            // // do not send any error message.***********8
            // return true;
            
            // Without "return User.findOne.", the catch statement must be specified.
            // Otherwise, it will generate promise unhandled error.
            // })
            // .catch( e => { console.log(e)})

            })
        }),
        // check req.password
        body(
                'password',
                // default message of all of password validator!!
                'Please enter a password only with numbers and texts and with at least 4 characters.'
            )
            .isLength({ min: 4 })
            // Here is only with error of isLength()
            // .withMessage('Please enter a password only with numbers and text and with at least 4 characters.')
            
            // isAlphanumeric: only allows normal characters and number.
            .isAlphanumeric()
            .trim(),
            
            // Here is with isLength() and is Alpahnumeric()
            // Error message should be a sort of accumulated
            // .withMessage('Please enter a password only with numbers and text and with at least 4 characters.')
        body('confirmPassword')
            .trim()
            .custom((value, {req}) => {
                if(value !== req.body.password)
                throw new Error('The passwords have to be identified.');
                
                return true;
            })
        
    ], 
    postSignup);

// [My Solution]
// router.post('/login', 
//         // no multi-validation check
//         body('email')
//         .custom((value, { req }) => {

//             // custom return            
//             return User.findOne({ email: value })
//                 .then(user => {
                    
//                     if(!user) {
//                         // when return Promise.reject(), custom() will terminate this callback.
//                         //  therefore, res.redirect('/login') is not required. 
//                         return Promise.reject('Unable to identify the email address.');         
//                     }
                    
//                     // return is required because the function parameter(callback) of custom() requires return.
//                     //  when if(user === true), what is supposed to return?
//                     //  return Promise.reject is a return of callback(resolve) of promise, not custom()'s functional parameter.
//                     return bcrypt.compare(req.body.password, user.password)
//                         .then(isMatched => {
//                             if(!isMatched) {
//                                 return Promise.reject('Unable to find the password');
//                            }
//                         })
//                         // no catch is necessary here as well
//                         //  because cusom will treat catch
//                         //  when it returns Promise.reject()
                    
//                 })

//         }),

//[Max's Solution]
router.post('/login', 
        // no multi-validation check
       [ 
            body('email')
                .isEmail()
                .withMessage('Please enter your valid email address.')
                .normalizeEmail()
                .trim(),

            body('password', 'Please enter min 4 characters including texts and numers')
                .isLength({ min: 4 })
                .isAlphanumeric()
                .trim()
       ],
    postLogin);


router.post('/logout', postLogout);

router.post('/reset', postReset);

router.post('/new-password', postNewPassword);

module.exports = router;