// express 4.0 新增路由物件
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/order.js');
const Product = require('../models/product.js');
const checkAuth = require('../middleware/check-auth.js');

router.use(checkAuth);// jwt 驗證

router.get('/', function(req, res, next) {
  Order.find()
    .select('product quantity _id')
    .populate('product', 'name') // 外鍵填充 需要ref, product.name
    .exec()
    .then(function(docs) {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(function(doc) {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: 'GET',
              url: 'http://127.0.0.1:3000/orders/' + doc._id
            }
          }
        })
      });
    })
    .catch(function(err) {
      res.status(500).json({
        error: err
      });
    });
});

router.post('/', function(req, res, next) {
  // 先確認有這個productID 回傳promise 然後再 .then()
  Product.findById(req.body.productID)
    .then(function(product) {      
      if(product == null) {
        return res.status(404).json({
          message: 'Product not found'
        });
      }
      // 除存 order
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productID
      });
      return order.save(); // 回傳promise 然後再 .then()
    })
    .then(function(result) {
      console.log(result);
      res.status(201).json({// 201 Created: 請求成功且新的資源成功被創建
        message: 'Order stored',
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: 'POST',
          url: 'http://127.0.0.1:3000/orders' + result._id
        }
      }); 
    })
    .catch(function(err) {
      res.status(500).json({
        message: 'Product not found',
        error: err
      });
    });
});

router.get('/:orderID', function(req, res, next) {
  Order.findById(req.params.orderID)
    .populate('product')
    .exec()
    .then(function(order) {
      if(!order) { // 應該是要丟出錯誤比較好
        return res.status(400).json({
          message: 'Order not found'
        });
        // throw new Error("Order not found");
      }
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: 'http://127.0.0.1:3000/orders'
        }
      });
    })
    .catch(function(err) {
      res.status(500).json({
        error: err
      });
    });
});

router.delete('/:orderID', function(req, res, next) {
  Order.remove({_id: req.params.orderID})
    .exec()
    .then(function(result) {
      res.status(200).json({
        message: 'Order deleted',
        request: {
          type: 'delete',
          url: 'http://127.0.0.1:3000/orders'
        }
      });
    })
    .catch(function(err) {
      res.status(500).json({
        error: err
      });
    });
});

module.exports = router;