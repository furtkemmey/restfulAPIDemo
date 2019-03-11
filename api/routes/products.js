// express 4.0 新增路由物件
const express = require('express');
const router = express.Router();
const Product = require('../models/product.js');
const mongoose = require('mongoose');
const checkAuth = require('../middleware/check-auth.js');

const multer = require('multer'); // post 檔案
const storage = multer.diskStorage({ //設定屬性
  destination: function(req, file, cb) {
    cb(null, './uploads/'); // 上傳目錄
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname); // 檔案名稱
  }
});
const fileFiiter = function(req, file, cb) { // 限制檔案名稱
  if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true); //設定允許存取
  } else {
    cb(null, false);
  }
}
// upload.single('productImage')
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5 // 檔案大小限制
  },
  fileFilter: fileFiiter
}); 

router.get('/', function(req, res, next) {
  // find all
  Product.find()
    .select('name price _id productImage') // 選擇要顯示的項目
    .exec()
    .then(function(docs) {
      // console.log(docs);      
      const respose = {
        status: 200,
        count: docs.length,
        products: docs.map(function(doc) {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://127.0.0.1:3000/products/' + doc._id
            }
          }
        })
      };
      // if(doc.length >0) {
        res.status(200).json(respose);
      // } else {
      //   res.status(404).json({
      //     message: 'No entries found'
      //   });
      // }
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// 嘗試用router.use()
// 得到post資料然後儲存         // 圖片的key
// router.post('/', checkAuth, upload.single('productImage'), function(req, res, next) {
// router.use('/', checkAuth);
router.post('/', checkAuth); // 只有部份要才這樣做
router.post('/', upload.single('productImage'));
router.post('/', function(req, res, next) {  
  // mongoose 儲存
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  product
    .save()
    .then(function(result) {
      console.log(result);
      res.status(201).json({
        message: 'Created product successfully',
        createdProduct: {
          name: result.name,
          price: result.price,
          _id: result._id,
          request: {
            type: 'post',
            url: 'http://127.0.0.1:3000/products/' + result._id
          }
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json({
        message: 'product save fail',
        error: err
      });
    });
});

router.get('/:productID', function (req, res, next) {  
  const id = req.params.productID;
  Product.findById(id)
    .select('name price _id productImage') // 選擇要顯示的項目
    .exec() //回傳promise物件
    .then(function(doc) {
      console.log(doc);
      if(doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'get',
            url: 'http://127.0.0.1:3000/products'
          }
        });
      } else {
        res.status(404).json({
          message: 'No valid entry found for provided ID'
        });
      }
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});

// 傳入陣列的表頭名稱跟數值 可以多個
// [
//   {
//     "propName": "name", // 表頭名稱 name | price
//     "value": "something" // 數值
//   }
// ]
router.patch('/:productID', checkAuth);
router.patch('/:productID', function (req, res, next) {  
  const id = req.params.productID;
  const updateOps = {};
  for(const ops of req.body) {
    updateOps[ops.propName] = ops.value; // 字典新增
  }
  Product.update({_id: id},{$set: updateOps})
    .exec()
    .then(function(result) {
      // console.log(result);
      res.status(200).json({
        message: 'Product updated',
        request: {
          type: 'GET',
          url: 'http://127.0.0.1:3000/products/' + _id
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});
router.delete('/:productID', checkAuth);
router.delete('/:productID', function (req, res, next) {  
  const id = req.params.productID;
  Product.remove({_id: id})
    .exec()
    .then(function(result) { 
      res.status(200).json({
        message: 'product deleted',
        request: {
          type: 'POST',
          url: 'http://127.0.0.1:3000/products',
        }
      });
    })
    .catch(function(err) {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
});


module.exports = router;