// express 4.0路由 新的寫法
// morgan日誌
// post請求使用body-parser
// mongoose connect寫法
// 錯誤處理 app.use(function(error, req, res, next)
// CORS 設定
// multer 上傳圖片
// jsonwebtoken 寫middleware (check-auth.js) 然後router.use(checkAuth);

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const morgan = require('morgan'); // 日誌
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

// moongoose
const mongooseURL = 'mongodb://127.0.0.1/product';
mongoose.connect(mongooseURL, {useNewUrlParser: true, useCreateIndex: true});
const db = mongoose.connection;
mongoose.Promise = global.Promise;
// mongoose.set('useCreateIndex', true);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("Database Connected => ", mongooseURL);
});

// express 4.0 新的路由用法
const productRoutes = require('./api/routes/products.js');
const orderRouters = require('./api/routes/orders.js');
const userRouters = require('./api/routes/user.js');

// 自己定義日誌格式
// morgan.format('kemmey', '[kemmey] :method :url :status');
// app.use(morgan('kemmey'));
app.use(morgan('dev'));

app.use('/uploads', express.static('./uploads'));

// CORS
app.use(function(req, res, next) {
  res.header('Access-Controll-Allow-Origin', '*');
  res.header('Access-Controll-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if(req.method == 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

// bodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use('/products', productRoutes); // 掛載路由物件
app.use('/orders', orderRouters);
app.use('/user', userRouters);

// 設定error 狀態
app.use(function(req, res, next){ // 以上都沒有匹配到的話 設定狀態= 404
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use(function(error, req, res, next) { // 錯誤處理 有四個引數
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      status: error.status
    }
  });
});

app.listen(port, function(error){
  console.log('port is on ', port);
  console.log('platform is on ', process.platform);
  console.log('CPU is ', process.arch);
});