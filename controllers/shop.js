const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err =>{
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);    
    });
    // .catch(err => {
    //   console.log(err);
    // });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err =>{
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);    
    });
    //.catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'

        // 2) By using the following at index.js
        //  we can set it up that value will automatically reach views
        //  that is required to get. 

        // app.use((req, res, next) => {
        //      res.locals.isAuthenticated = req.session.isAuthenticated;
        //      res.locals.csrfToekn = req.csrfToken();
        // })

        // -----------------------------------------------------------
        // 1)
        // isAuthenticated: req.session.isAuthenticated,
        
        // req.csrfToken() ==> get token value from csurf lib.
        
        // insert this token value into form's hidden input as a value
        // and in the form's action token value is verifed in the server with csurf lib.
        // In order to csurf find the verified token, the token variable name must be "_csrf" 
        
        // BTW, csrfToken() is provided by csurf's embedded middleware 
        // It goes to form inputs because csrf protection 
        //  kicks in "at the client's all post req"
        //  by setting up "app.use(csrfToken)"" in index.js
        //csrfToken: req.csrfToken()
      });
    })
    .catch(err =>{
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);    
  });
    // .catch(err => {
    //   console.log(err);
    // });
};

exports.getCart = (req, res, next) => {

  // console.log(req.session.user.cart.items)
  
  // { cart: { items: [ [Object] ] },
  // console.log('typeof req.session.user', req.session.user) // => plain user object!
  
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
        // find above
        // isAuthenticated: req.session.isAuthenticated
      });
    })
    .catch(err =>{
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);    
  });
    // .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {

      // { cart: { items: [ [Object] ] },
      // console.log('typeof req.session.user', req.session.user) // => plain user object!****************8
      
      // Therefore we must use req.user which in an instance....
      // Please, you must find the auth postLogin controller to understand it.
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  // also, req.user must be used
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err =>{
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);    
  });
    //.catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  req.user
    // populate must work with mongoose instance
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {

        //_doc : pulled out collection's document fields only
        return { qty: i.qty, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.session.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {
        // also, req.user must be used
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect('/orders');
    })
    .catch(err =>{
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);    
  });
    // .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.session.user._id })
    .then(orders => {

      console.log(orders)
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
        // find above
        // isAuthenticated: req.session.isAuthenticated
      });
    })
    .catch(err =>{
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);    
  });
    // .catch(err => console.log(err));
};
