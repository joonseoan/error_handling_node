  
  // ***************** IMPORTANT *******************
  // 1) Signup...: just store the user
  
  // 2) login: just match the username and password
  //  then provides cookie
  
  // 3) First isAuthenticated is used in navigation.ejs // in ui!!!
  //  to block the unauthorized user to button-clcik
  
  // 4) "isAuth" blocks user to use this url by entering url (based on Session)
      //  localhost:3000/admin/add-product.
      // if(!req.session.isAuthenticated) {
      //   return res.redirect('/login');
      // }
  
  // 5) isPaid...can be used!!! (need to make it my self)

  // 6) The route can be seen but nothing the user is able to do 
  //  because the user does not not have authority ====> may be it could be same as isPaid user above

const express = require('express');
const router = express.Router();
const { body } = require('express-validator/check');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

/* 
  isAuth middleware
  When the middleare is used as a paramter,
  the order is a left-right order.
  In result it must be ahead of getAddProdut

  However, when we use it as app.use('/route', (req, res, next) => {
      next() is indicates the next line app.use!!
  })

*/

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product', [
  body('title')
    .isString()
    .isLength({ min: 3 })
    .trim(),

  // not working with google image
  // body('imageUrl')
  //   .isURL(),

  body('price')
    .isFloat(),
  
  body('description')
    .isLength({ min: 8, max: 100 })
    .trim()
], isAuth, adminController.postAddProduct);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

router.post('/edit-product', [
  body('title')
    // .isAlphanumeric() // not working with white space
    .isString()
    .isLength({ min: 3 })
    .trim(),

  // body('imageUrl')
  //   .isURL(),

  body('price')
    .isFloat(),
  
  body('description')
    .isLength({ min: 8, max: 100 })
    .trim()
], isAuth, adminController.postEditProduct);

router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
