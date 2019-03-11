// middleware
// 驗證token
// 從header取得token 然後驗證
const jwt = require('jsonwebtoken');

// middleware 設定資料到req.userData 
module.exports = function(req, res, next) {
  // try {
  //   const token = req.headers.authorization.split(' ')[1];
  //   const decoded = jwt.verify(token, process.env.JWT_KEY);
  //   req.userData = decoded;
  //   console.log(decoded);
  //   next();
  // } catch(err) {
  //   return res.status(401).json({
  //     message: 'Auth failed',
  //     error: err
  //   });
  // }

    if(req.headers.authorization == null) {
      res.status(401).json({
          message: 'Authorization is null'
      });
    }
    // 從header取得token
    const token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, process.env.JWT_KEY, function(err, decoded) {
      if(err) {
        res.status(401).json({
            message: 'Auth failed',
            error: err
        });
      } else {
        req.userData = decoded;
        console.log(decoded);
        next();
      }
    });
}