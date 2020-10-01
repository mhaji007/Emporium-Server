// Used for handling form data (images, etc.)
const formidable = require("formidable");
const _ = require("lodash");
// Core module used in accessing file system
const fs = require('fs');
const Product = require("../models/product");
const { errorHandler } = require("../helpers/dbErrorHandler");

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
      console.log('UPLOAD ERROR ----->', err)
      return res.status(400).json({
        error:'Image could not be uploaded'
      })
    }
    // Use fields in to create a product
    let product= new Product(fields);

    if (files.photo){
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
