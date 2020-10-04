// Used for handling form data (images, etc.)
const formidable = require("formidable");
const _ = require("lodash");
// Core module used in accessing file system
const fs = require('fs');
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

//==== find product by Id middleware ====//

// Middleware that makes product available
// on the req object used by GET, DELETE, and
// POST routes

exports.productById = (req, res, next, id) => {
  Product.findById(id).exec((err, product)=>{
    if(err || !product) {
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
}

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
        error:'Image could not be uploaded'
      })
    }

    // Check for all fields
    const {name, description, price, category, quantity, shipping} = fields;

    if(!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({
        error:'All fields are required!'
      })

    }
    // Use fields in to create a product
    let product= new Product(fields);

    if (files.photo){
      if(files.photo.size > 1000000) {
        return res.status(400).json({
          error:'Image should be less than 1MB in size'
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    product.save((err, result)=>{
      if (err) {
        // console.log(err);
        return res.status(400).json({
          error:errorHandler(error)
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
        error:errorHandler(err)
      });
    };
    res.json({
      // deletedProduct,
      "message":"Product deleted successfully"
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
        error:'Image could not be uploaded'
      })
    }

    // Check for all fields
    const {name, description, price, category, quantity, shipping} = fields;

    if(!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({
        error:'All fields are required!'
      })

    }

    let product= req.product;
    product = _.extend(product, fields);

    if (files.photo){
      if(files.photo.size > 1000000) {
        return res.status(400).json({
          error:'Image should be less than 1MB in size'
        });
      }
      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }
    product.save((err, result)=>{
      if (err) {
        // console.log(err);
        return res.status(400).json({
          error:errorHandler(error)
        });
      }
      res.json(result);
    });
  });
};

//=========================//

//==== Return Product by sold/arrival ====//

// by sell = /products?sortBy=sold&order=desc&limit=4
// by arrival = /products?sortBy=createdAt&order=desc&limit=4
// if no params are sent, then all products are returned

exports.list = (req, res) => {
  let order = req.query.order ? req.query.order : 'asc'
  let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
  let limit = req.query.limit ? req.query.limit : 6

  product.find()
        // deselect photos
        // because photos are saved
        // in the form of binary data
        // and saving them all
        // requires a lot od space
        // Therefore. photos are displayed via
        // a separate fetch
         .select("-photo")
         // populate particular
         // category related to
         // product
         .populate("category")
         // sort by sortBy and order
         .sort([[sortBy, order]])
         .limit(limit)
         .exec((err, products) => {
           if(err) {
             return res.status(400).json({
               error: 'Products not found'
             })
           }
           res.send(products);
         })


}

//========================================//

