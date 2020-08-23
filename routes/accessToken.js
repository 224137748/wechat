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
const fs = require("fs");
const { appID, appsecret } = require("../config");
const axios = require("axios");
const { resolve } = require("path");
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

  /**
   *保存access_token
   * @param {*} accessToken
   * @memberof Wechat
   */
  saveAccessToken(accessToken) {
    return new Promise((resolve, reject) => {
      fs.writeFile("./accessToken.txt", JSON.stringify(accessToken), (err) => {
        if (!err) {
          resolve();
        } else {
          reject(`保存文件出错： ${err}`);
        }
      });
    });
  }

  /**
   *读取本地token
   *
   * @memberof Wechat
   */
  readAccessToken() {
    return new Promise((resolve, reject) => {
      fs.readFile("./accessToken.txt", (err, res) => {
        if (!err) {
          try {
            const data = JSON.parse(res);
            resolve(data);
          } catch (error) {
            reject("读取文件失败： " + error);
          }
        } else {
          reject("读取文件失败： " + err);
        }
      });
    });
  }

  /**
   *检验token是否是有效的，根据时间判断
   *
   * @memberof Wechat
   */
  isValidAccessToken(data) {
    if (!data && !data.accessToken && !data.expires_in) return false;

    return data.expires_in > Date.now();
  }

  /**
   *获取access_token
   *
   * @returns {Promise<string>}
   * @memberof Wechat
   */
  fetchAccessToken() {
    // 先判断内存中是否缓存
    if (this.accessToken && this.expires_in && this.isValidAccessToken(this)) {
      return Promise.resolve({
        accessToken: this.accessToken,
        expires_in: this.expires_in,
      });
    }

    return this.readAccessToken()
      .then(async (res) => {
        // 判断是否有效
        if (this.isValidAccessToken(res)) {
          return Promise.resolve(res);
        } else {
          const data = await this.getAccessToken();
          this.saveAccessToken(data);
          // 返回一个Promise 方便最外一层调用then，
          return Promise.resolve(data);
        }
      })
      .catch(async (err) => {
        const data = await this.getAccessToken();
        this.saveAccessToken(data);
        return Promise.resolve(data);
      })
      .then((res) => {
        this.accessToken = res.accessToken;
        this.expires_in = res.expires_in;
        return Promise.resolve(res);
      });
  }
}

const wechat = new Wechat();
wechat.fetchAccessToken();
