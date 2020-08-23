// signature=0eaa5ead55cb026f2ad741fb07d541c7aae97490 签名
// echostr=662267024130439964 微信随机字符串
// timestamp=1597930008 微信发送请求时间戳
// nonce=2138781892 微信随机数字

/* 
  开发者服务器 - 验证消息是否来自于微信服务器
  目的： 计算得出signature与微信返回的signature是否一致，如果一致则表明来自于微信服务器
  算法： 
    1.将参与微信签名的三个参数（timestamp、nonce、token）组合在一起，按照字典排序，并组合在一起。
    2.将数组拼接成一个字符串，进行sha1加密。
    3.生成的signature与微信进对比，如果一样，则返回echostr给微信服务器
*/

/* 用这种方式可以通过函数向中间件传递参数 */

const sha1 = require("sha1");
const config = require("../config");
const template = require("../wechat/template");
const {
  getUserDataAsync,
  parseXMLAsync,
  formateMessage,
} = require("../utils/tools");

module.exports = () => {
  return async (req, res, next) => {
    try {
      const { signature, timestamp, echostr, nonce } = req.query;
      const { token } = config;

      const arr = [timestamp, nonce, token].sort();
      const sha1_str = sha1(arr.join(""));

      if (req.method === "GET") {
        // get 请求微信一般用于验证服务器
        if (sha1_str === signature) {
          res.send(echostr);
        } else {
          res.end("err");
        }
      } else if (req.method === "POST") {
        if (sha1_str !== signature) res.end("end");

        const xmlData = await getUserDataAsync(req);
        const jsData = await parseXMLAsync(xmlData);
        const message = await formateMessage(jsData);

        let options = {
          toUserName: message.FromUserName,
          fromUserName: message.ToUserName,
          createTime: Date.now(),
          msgType: message.MsgType,
        };
        console.log(message);
        // 如果开发者服务器没有响应微信服务器，微信会发送3次请求过来
        res.end("");
      }
    } catch (error) {
      res.end("err");
      console.log(error);
    }
  };
};
