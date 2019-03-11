const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user.js');
const bcrypt = require('bcrypt'); // 密碼加密
const jwt = require('jsonwebtoken') // jwt

// 註冊功能
router.post('/signup', function(req, res, next) {
  // 先檢查重複使用者
  User.find({email: req.body.email})
    .exec()
    .then(function(user) {
      if(user >= 1) {
        // 用戶存在
        return res.status(409).json({ // 409 衝突
          message: 'Mail exists'
        });
      } else{
        // 新增用戶
        // 加密 密碼
        bcrypt.hash(req.body.password, 10, function(err, hash) {
          if(err){
            return res.status(500).json({
              message: '加密失敗',
              error: err
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash
            });
            user.save()
              .then(function(result) {
                console.log(result);
                res.status(201).json({
                  message: 'User created'
                });
              })
              .catch(function(err) {
                console.log(err);
                res.status(500).json({
                  message: '除存失敗',
                  error: err
                });
              });
          }
        });
      }
    })
    .catch(function(err) {
      res.status(500).json({
        status: 500,
        error: err
      });
    }); 
});

// 登入功能 簽發token
router.post('/login', function(req, res, next) {
  // 檢查使用者
  User.find({email: req.body.email})
    .exec()
    .then(function(user) {
      // 找不到使用者
      if(user.length < 1) {
        return res.status(401).json({
          message: 'Auth failed cant find user'
        });
      }
      // 比較密碼
      bcrypt.compare(req.body.password, user[0].password, function(err, result) {
        if(err) {
          console.log(err);
          return res.status(401).json({
            message: 'Auth failed',
            error: err
          });
        }
        // 比對密碼成功 用email跟id 做出token
        if(result) {
          jwt.sign({
              email: user[0].email,
              userId: user[0]._id
            }, 
            process.env.JWT_KEY, { // 定義在nodemon.json
              expiresIn: '1h' // 到期
            },
            function(err, tokenKey) {
              res.status(200).json({
                message: 'Auth successful',
                email: user[0].email,
                token: tokenKey
              });
            }            
          ); 
          // return;
        } else {
          res.status(401).json({
            message: 'Auth failed'
          });
        }
      });
    })
    .catch(function(err) {
      res.status(500).json({
        error: err
      });
    });
});

router.delete('/:userID', function(req, res, next) {
  User.remove({_id: req.params.userID})
  .exec()
  .then(function(result) {
    res.status(200).json({
      message: 'User deleted',
      result: result
    });
  })
  .catch(function(err) {
    res.status(500).json({
      error: err
    });
  });
});
module.exports = router;