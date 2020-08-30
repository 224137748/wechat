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
const path = require("path");
const axios = require("axios");
const qs = require("qs");
const menu = require("../config/menu");
const api = require("../config/api");

class Wechat {
  constructor() {}

  /**
   *用来获取access_token
   * @memberof Wechat
   */
  getAccessToken() {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await axios({
          url: api.getAccessToken,
          params: {
            grant_type: "client_credential",
            appid: appID,
            secret: appsecret,
          },
        });
        const tokenInfo = res.data;
        tokenInfo.expires_in =
          Date.now() + (tokenInfo.expires_in - 5 * 60) * 1000;
        console.log("tokenInfo ===>", tokenInfo);
        resolve(tokenInfo);
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  /**
   *保存access_token
   * @param {*} access_token
   * @memberof Wechat
   */
  saveAccessToken(tokenInfo) {
    return new Promise((resolve, reject) => {
      fs.writeFile(
        path.resolve(__dirname, "./accessToken.txt"),
        JSON.stringify(tokenInfo),
        (err) => {
          if (!err) {
            resolve();
          } else {
            reject(`保存文件出错： ${err}`);
          }
        }
      );
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
            reject("读取accessToken文件失败： " + error);
          }
        } else {
          reject("读取accessToken文件失败： " + err);
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
    if (!data && !data.access_token && !data.expires_in) return false;

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
    if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in,
      });
    }

    return this.readAccessToken()
      .then(async (res) => {
        // 判断是否有效
        if (this.isValidAccessToken(res)) {
          const { access_token, expires_in } = res;
          this.access_token = access_token;
          this.expires_in = expires_in;
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
        this.access_token = res.access_token;
        this.expires_in = res.expires_in;
        return Promise.resolve(res);
      });
  }

  /**
   * 创建公众号菜单
   */
  createMenu() {
    return new Promise(async (resolve, reject) => {
      const data = await this.fetchAccessToken();
      if (!data.access_token) return;
      const url = `${api.createMenu}?access_token=${data.access_token}`;
      const meunStr = qs.stringify(menu);
      try {
        const res = await axios({
          url,
          method: "post",
          data: menu,
        });
        console.log(res.data);
        if (res.errcode === 0) {
          resolve(res);
        } else {
          reject(res);
        }
      } catch (err) {
        console.log(err);
        reject(err);
      }
    });
  }

  /**
   *删除菜单栏
   *
   * @returns
   * @memberof Wechat
   */
  deleteMenu() {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.fetchAccessToken();
        const url = `${api.deleteMenu}?access_token=${data.access_token}`;
        const res = await axios({
          url,
          method: "get",
        });
        console.log("res", res.data);
        if (res.data.errcode === 0) {
          resolve();
        } else {
          reject();
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *获取js_sdk
   *
   * @returns
   * @memberof Wechat
   */
  getTicket() {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await this.fetchAccessToken();
        if (!data.access_token) return;

        const res = await axios({
          url: api.getTicket,
          method: "get",
          params: {
            type: "jsapi",
            access_token: data.access_token,
          },
        });
        if (res.data.errcode === 0) {
          // console.log("res", res.data);
          let { ticket, expires_in } = res.data;
          expires_in = Date.now() + (expires_in - 5 * 60) * 1000;
          resolve({ ticket, expires_in });
        } else {
          reject(res.data);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   *保存ticket
   *
   * @param {*} ticketINfo
   * @memberof Wechat
   */
  saveTicket(ticketInfo) {
    return new Promise(async (resolve, reject) => {
      fs.writeFile(
        path.resolve(__dirname, "./ticket.txt"),
        JSON.stringify(ticketInfo),
        (err) => {
          if (!err) {
            resolve();
          } else {
            reject(`保存文件出错： ${err}`);
          }
        }
      );
    });
  }

  /**
   *读取本地ticket
   *
   * @memberof Wechat
   */
  readTicket() {
    return new Promise((resolve, reject) => {
      fs.readFile("./ticket.txt", (err, res) => {
        if (!err) {
          try {
            const data = JSON.parse(res);
            console.log("read_file", data);
            resolve(data);
          } catch (error) {
            reject("读取ticket.txt文件失败：" + error);
          }
        } else {
          reject("读取ticket.txt文件失败：" + err);
        }
      });
    });
  }

  /**
   *检验ticket是否是有效的
   *
   * @param {*} data
   * @returns
   * @memberof Wechat
   */
  isValidTicket(data) {
    if (!data && !data.ticket && !data.expires_in) {
      return false;
    }
    return data.expires_in > Date.now();
  }

  /**
   *获取当前的ticket
   *
   * @returns
   * @memberof Wechat
   */
  fetchTicket() {
    // 先判断内存中是否有缓存
    const ticketInfo = this.ticketInfo;
    if (ticketInfo && ticketInfo.expires_in && this.isValidTicket(ticketInfo)) {
      return Promise.resolve(ticketInfo);
    }
    return this.readTicket()
      .then(async (res) => {
        if (this.isValidTicket(res)) {
          return Promise.resolve(res);
        } else {
          const data = await this.getTicket();
          console.log("getTickData ==> ", data);
          this.saveTicket(data);
          return Promise.resolve(data);
        }
      })
      .catch(async (err) => {
        const data = await this.getTicket();
        this.saveTicket(data);
        return Promise.resolve(data);
      })
      .then((res) => {
        this.ticketInfo = res;
        return Promise.resolve(res);
      });
  }
}

const wechat = new Wechat();
wechat.fetchTicket();

module.exports = wechat;
