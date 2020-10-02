// Used for handling form data (images, etc.)
const formidable = require("formidable");
const _ = require("lodash");
// Core module used in accessing file system
const fs = require('fs');
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

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


exports.read = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
}

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
        error:'All fields are required!'
      })
    }

    // Check for all fields
    const {name, description, price, category, quantity, shipping} = fields;

    if(!name || !description || !price || !category || !quantity || !shipping) {
      return res.status(400).json({
        error:'Image could not be uploaded'
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
