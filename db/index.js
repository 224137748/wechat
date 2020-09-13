const mongoose = require('mongoose');

module.exports = new Promise((resolve, reject) => {
  // 链接数据库  数据库IP地址 + 数据库名称
  mongoose.connect('mongodb://localhost:27017/movie', {
    useNewUrlParser: true,
  });

  // 绑定事件监听
  mongoose.connection.once('open', (err) => {
    if (!err) {
      resolve();
    } else {
      reject();
    }
  });
});
