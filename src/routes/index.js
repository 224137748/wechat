const express = require('express');
const router = express.Router();
const config = require('../config');

const reply = require('../reply');
const usersRouter = require('./users');
const Wechat = require('../wechat');
const wechat = new Wechat();

router.use('/api/wechat/users', usersRouter);

router.get('/api/wechat/search', async (req, res) => {
  const js_sdk_config = await wechat.getJsSdkConfig(config.url + req.url);
  res.render('search', { ...js_sdk_config });
});
router.get('/api/wechat/getSdk', async (req, res) => {
  const js_sdk_config = await wechat.getJsSdkConfig(config.url + req.path);
  res.json(js_sdk_config);
});

// 处理消息回复
router.all('/api/wechat', reply());
module.exports = router;
