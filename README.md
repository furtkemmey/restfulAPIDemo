# restfulAPIDemo
## 學習知識

- express 4.0路由 新的寫法
  - 改用 const router = express.Router();
  - 然後 掛載路由物件 app.use('/products', productRoutes);
- morgan日誌
  - app.use(morgan('dev'));
- post請求使用body-parser

        app.use(bodyParser.urlencoded({extended: false}));
        app.use(bodyParser.json());
        
- mongoose
  - 連線設定
  - schema定義
  - 定義objectID

        mongoose.Schema.Types.ObjectId

  - 使用ObjectID
  
        mongoose.Types.ObjectId()
        
  - ref跟populate()
- 錯誤處理 app.use(function(error, req, res, next)
- CORS 設定
- bcrypt密碼加密
  - bcrypt.hash()
  - bcrypt.compare()
- multer 上傳圖片
  - 設定 multer.diskStorage()
  - router.post('/', upload.single('productImage'));
- jsonwebtoken
  - 簽發 jwt.sign() 資訊 密碼 到期
  - 寫middleware (check-auth.js) jwt.verify()
  - 然後router.use(checkAuth);
