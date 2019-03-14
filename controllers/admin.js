// const { ObjectId } = mongoose.Types;
const { validationResult } = require('express-validator/check');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    hasError: false,
    editing: false,
    errorMessage: null,
    validationError: []
    // isAuthenticated: req.session.isAuthenticated
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);

  if(!errors.isEmpty()) {

    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      hasError: true,
      editing: false,
      product: { title, imageUrl, price, description } ,
      errorMessage: errors.array()[0].msg,
      validationError: errors.array()
    });
  }

  const product = new Product({
    // _id: new ObjectId('5c895a6975db8d2448c2e6ec'),
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,

    // ref is assined in schema
    // Better to use req.user
    userId: req.user
  });
  
  product
    .save()
    .then(result => {
      res.redirect('/admin/products');
    })
    .catch(err => {
          
      // [ Option 4 ]
      let message;
      const errors = new Error(message || err);
      
      // adding the error code
      errors.httpStatusCode = 500;
      
      // call app.use((error, req, res, next) => {
        // res.redirect('/get500');
      // })
      // errors === error above not identified. It is ok.
      next(errors);

      // It is working by the way here.
      // if do add some error message, for the developer
      // we can make use of it.
      // It is sent to the console.
      throw new Error ('Unable to store the product.');
      
      // [ Option 3 ]
      // directly get the route of the error message page 
      //  without centeral app.use(error, req, res, next) in app.js
      // res.redirect('/get500');

      // [ Option 2 ]
      // res.status(422).render('admin/edit-product', {
      //   pageTitle: 'Add Product',
      //   path: '/admin/add-product',
      //   hasError: true,
      //   editing: false,
      //   product: { title, imageUrl, price, description } ,
      //   errorMessage: 'Unable to save the fu product.',
      //   validationError: errors.array()
      // });

      // [ Option 1 ] xxxxxxxxxxxxxxxxxxxxxxxxxx
      // console.log(err);

      // It is working also...
      // It is sent to the console.
      // throw new Error ('Unable to store the product.');
      
    });

};

exports.getEditProduct = (req, res, next) => {
  // req.query is a built-in express method
  const editMode = req.query.edit;
  
  if (!editMode) {
    return res.redirect('/');
  }

  const prodId = req.params.productId;

  Product.findById(prodId)
    .then(product => {
      
      if (!product) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        hasError: false,
        editing: editMode,
        product: product,
        errorMessage: null,
        validationError: []
       // isAuthenticated: req.session.isAuthenticated
      });
    })
    .catch(e => {
      
      let message;
      const errors = new Error(message || err);
      errors.httpStatusCode = 500;
      return next(errors);
      
    });
};

exports.postEditProduct = (req, res, next) => {
  
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);

  if(!errors.isEmpty()) {

    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      hasError: true,
      editing: true,
      product: { 
        title: updatedTitle, 
        imageUrl: updatedImageUrl, 
        price: updatedPrice, 
        description: updatedDesc,

        // ********************
        /* 
            <% if(editing) { %>
                <input type="hidden" value="<%= product._id %>" name="productId">
            <% } %>
        */
        // when we have an error at first,
        // product._id above in "edit-product.ejs" is not available
        //    because in this render function, product instance from Product model 
        //    like in "no error render of getEditProduct()"
        //    is not available. An error is not generated as long as still validation error exists
        //    and stops it to run the next line.
        // 
        // However, it will generate an error, when the validation has no error at all.
        // First of all, the form request won't start from the getEditProduct() route.
        // The from request will start the error-based render page above in this route.
        //  Therefore, the front-end still does not have product._id and mongoose model
        //  does not dave this default field in the data base.
        // In result, we need to put _id here.
        _id: prodId },
      errorMessage: errors.array()[0].msg,
      validationError: errors.array()

    });
  }

  Product.findById(prodId)
    .then(product => {

      // - block any other user to edit and delete products
      // even though we setup getProducts with find({userId: req.user_id })
      //  with at any tools, the hacker will be able to find products 
      //  then will be able to edit and delete products.


      // To protect the products from the malfunctions above,
      // we would need to add another safety function over here.
      if(product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      // gotta differentiate new prodct and product update.
      // updateOne would be easier.
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save()
      .then(result => {
        res.redirect('/admin/products');
      })
      .catch(err => {
        let message;
        const errors = new Error(message || err);
        errors.httpStatusCode = 500;
        return next(errors);
      });
    });
};


exports.getProducts = (req, res, next) => {
  
  // 2) it is a way to find "products" uploaded by the current logged-in user.
  Product.find({ userId: req.user._id })
  
  // 1)
  // The one below is for the all logged-in user.
  // All logged-in user must not control edit and delete
  //  because the products are not uploaded by them.
  // It must be managed by a user who uploaded the products.
  // Product.find()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        // isAuthenticated: req.session.isAuthenticated
      });
    })
    .catch(err => {
      let message;
      const error = new Error(message || err);      
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;

  // we can delete product by using "deleteOne" which is from mongodb.
  // as explained above, a user who uploaded this product can delete the product!!!!
  Product.deleteOne({ userId: req.user._id, _id: prodId })
  
  // By using mongoose
  // Product.findByIdAndRemove(prodId)
    .then(() => {
      // force to throw an error.
      // By the way...it delted the product.
      // It is a callback after deleting the product.
      // throw new Error();

      res.redirect('/admin/products');
    })
    .catch(err =>{
      
      // [ Option 4 ]
      let message;
      const errors = new Error(message || err);      
      errors.httpStatusCode = 500;
      
      // errors === error above not identified. It is ok.
      return next(errors);
      // throw new Error(err);
      // [ Option 3 ]
      // directly get the route of the error message page
      // res.redirect('/get500');

      // [ Option 2 ]
      // res.statuscode(500).render(
      //  specifiy the associated error message
      // )

      // [ Option 1 ]
      // console.log(err);
    });
};
