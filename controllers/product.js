// Used for handling form data (images, etc.)
const formidable = require("formidable");
const _ = require("lodash");
// Core module used in accessing file system
const fs = require("fs");
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

//==== find product by Id middleware ====//

// Middleware that makes product available
// on the req object used by GET, DELETE, and
// POST routes

exports.productById = (req, res, next, id) => {
  Product.findById(id).exec((err, product) => {
    if (err || !product) {
      return res.status(400).json({
        error: "Product not found"
      });
    }
    req.product = product;
    next();
  });
};

//=========================//

//==== Read (find) product ====//

exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//============================//

//==== Create product ====//

// We need to send the form data
// to handle image upload
exports.create = (req, res) => {
  // console.log(req.body);
  // All form data is avaialabe in IncomingForm
  let form = new formidable.IncomingForm();
  form.keepEtensions = true;
  // const form = new Formidable();
  // form.keepExtensions = false;
  form.parse(req, (err, fields, files) => {
    if (err) {
      //console.log('UPLOAD ERROR ----->', err)
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }

    // Check for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        error: "All fields are required!"
      });
    }
    // Use fields in to create a product
    let product = new Product(fields);

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1MB in size"
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    product.save((err, result) => {
      if (err) {
        // console.log(err);
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      res.json(result);
    });
  });
};

//=========================//

//==== Remove product ====//

exports.remove = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    console.log(err);
    if (err) {
      return res.status(400).json({
        error: errorHandler(err)
      });
    }
    res.json({
      // deletedProduct,
      message: "Product deleted successfully"
    });
  });
};

//=========================//

//==== Update product ====//

exports.update = (req, res) => {
  // console.log(req.body);
  // All form data is avaialabe in IncomingForm
  let form = new formidable.IncomingForm();
  form.keepEtensions = true;
  // const form = new Formidable();
  // form.keepExtensions = false;
  form.parse(req, (err, fields, files) => {
    if (err) {
      //console.log('UPLOAD ERROR ----->', err)
      return res.status(400).json({
        error: "Image could not be uploaded"
      });
    }

    // Check for all fields
    const { name, description, price, category, quantity, shipping } = fields;

    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !shipping
    ) {
      return res.status(400).json({
        error: "All fields are required!"
      });
    }

    let product = req.product;
    product = _.extend(product, fields);

    if (files.photo) {
      if (files.photo.size > 1000000) {
        return res.status(400).json({
          error: "Image should be less than 1MB in size"
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    product.save((err, result) => {
      if (err) {
        // console.log(err);
        return res.status(400).json({
          error: errorHandler(error)
        });
      }
      res.json(result);
    });
  });
};

//=========================//

/*=========== Controller methods ===========*/

//==== Return Product by sold/arrival ====//

// by sold = /products?sortBy=sold&order=desc&limit=4
// by arrival = /products?sortBy=createdAt&order=desc&limit=4
// if no params are sent, then all products are returned

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : "asc";
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find()
    // deselect photos
    // because photos are saved
    // in the form of binary data
    // and saving them all
    // requires a lot of space.
    // Therefore photos are displayed via
    // a separate fetch
    .select("-photo")
    // populate particular
    // category related to
    // product
    .populate("category")
    // sort by sortBy and in the order
    // determined by order
    .sort([[sortBy, order]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found"
        });
      }
      res.json(products);
    });
};

//========================================//

//==== Return similar products =====//

// Find products based on req product
// category. Other products with the same
// category will be returned
exports.listRelated = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 6;

  Product.find({ _id: { $ne: req.product }, category: req.product.category })
    .limit(limit)
    .populate("category", "_id name")
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "Products not found"
        });
      }
      res.json(products);
    });
};


//==== Return categories used in products =====//

// Lists out all the product categoires
// Returns all categories based on products

exports.listCategories = (req, res) => {
  Product.distinct('category', {}, (err, categories) => {
    if (err) {
      return res.status(400).json({
        error: 'Categories not found'
      });
    }
    res.json(categories);
  });
};


//==== Return categories used in products =====//

// list products by search
// Implement product search in react frontend
// Show categories in checkbox and price range in radio buttons
// As user clicks on checkboxes and radio buttons
// make api request and display products

exports.listBySearch = (req, res) => {
  let order = req.body.order ? req.body.order : 'desc';
  let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
  let limit = req.body.limit ? parseInt(req.body.limit) : 100;
  let skip = parseInt(req.body.skip);

  // This object contains the category ids and
  // the price range and Will be updated based
  // on the req.body object
  let findArgs = {};

  // console.log(order, sortBy, limit, skip, req.body.filters);
  // console.log("findArgs", findArgs);

  for (let key in req.body.filters) {
      if (req.body.filters[key].length > 0) {
          if (key === 'price') {
              // gte -  greater than price [0-10]
              // lte - less than
              findArgs[key] = {
                  $gte: req.body.filters[key][0],
                  $lte: req.body.filters[key][1]
              };
          } else {
              findArgs[key] = req.body.filters[key];
          }
      }
  }

  Product.find(findArgs)
      .select('-photo')
      .populate('category')
      .sort([[sortBy, order]])
      .skip(skip)
      .limit(limit)
      .exec((err, data) => {
          if (err) {
              return res.status(400).json({
                  error: 'Products not found'
              });
          }
          res.json({
              size: data.length,
              data
          });
      });
};

//======================================//

//==== Return photo =====//

// Separate request from the client side
// is sent to this endpoint to load the
// images
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
      res.set('Content-Type', req.product.photo.contentType);
      return res.send(req.product.photo.data);
  }
  next();
};

//======================//

//==== Return searched products ====/

exports.listSearch = (req, res) => {
  // create query object to hold search value and category value
  const query = {};
  // assign search value to query.name
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
    // assigne category value to query.category
    if (req.query.category && req.query.category != 'All') {
      query.category = req.query.category;
    }
    // find the product based on query object with 2 properties
    // search and category
    Product.find(query, (err, products) => {
      if (err) {
        return res.status(400).json({
          error: errorHandler(err)
        });
      }
      res.json(products);
    }).select('-photo');
  }
};

//==================================/

/*========================================*/

