/* 
  获取access_token
  特点：
    1、唯一性
    2、有效时间2小时，提前5分钟请求更新token
    3、接口每天只能调用2000次
  请求地址：
  https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET

  设计思路：
    1、首次本地没有，发送请求获取access_token，保存下来（本地文件）
    2、第二次或以后：
      - 先去本地读取文件，判断access_token是否过期
      - 如果没有过期直接使用，否则请求最新的token，并更新文件
*/
const { appID, appsecret } = require("../config");
const axios = require("axios");
class Wechat {
  constructor() {}

  /**
   *用来获取access_token
   * @memberof Wechat
   */
  getAccessToken() {
    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appsecret}`;

    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios.get(url);
        const tokenInfo = res.data;
        tokenInfo.expires_in =
          Date.now() + (tokenInfo.expires_in - 5 * 60) * 1000;
        console.log(tokenInfo);
        resolve(tokenInfo);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }
}

const wechat = new Wechat();
wechat.getAccessToken();
