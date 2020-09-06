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
const { appID, appsecret, jsApiList } = require('../config')
const path = require('path')
const axios = require('axios')
const qs = require('qs')
const menu = require('../config/menu')
const api = require('../config/api')
const sha1 = require('sha1')
const {
  writeFileAsync,
  readFileAsync,
  isValidProperty,
} = require('../utils/tools')

/**
 * 定义存储token的文件
 */
const tokenFilePath = path.resolve(__dirname, './accessToken.txt')
/**
 * 定义存储ticket的文件
 */
const ticketFilePath = path.resolve(__dirname, './ticket.txt')

/**
 * 微信授权，凭据相关操作
 */
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
            grant_type: 'client_credential',
            appid: appID,
            secret: appsecret,
          },
        })
        const tokenInfo = res.data
        tokenInfo.expires_in =
          Date.now() + (tokenInfo.expires_in - 5 * 60) * 1000
        // console.log('tokenInfo ===>', tokenInfo)
        resolve(tokenInfo)
      } catch (err) {
        console.log(err)
        reject(err)
      }
    })
  }

  /**
   *获取access_token
   *
   * @returns {Promise<string>}
   * @memberof Wechat
   */
  fetchAccessToken() {
    // 先判断内存中是否缓存
    if (
      this.access_token &&
      this.expires_in &&
      isValidProperty(this, 'access_token')
    ) {
      return Promise.resolve({
        access_token: this.access_token,
        expires_in: this.expires_in,
      })
    }

    return readFileAsync(tokenFilePath)
      .then(async (res) => {
        // 判断是否有效
        if (isValidProperty(res, 'access_token')) {
          const { access_token, expires_in } = res
          this.access_token = access_token
          this.expires_in = expires_in
          return Promise.resolve(res)
        } else {
          const data = await this.getAccessToken()

          writeFileAsync(tokenFilePath, data)
          // 返回一个Promise 方便最外一层调用then，
          return Promise.resolve(data)
        }
      })
      .catch(async (err) => {
        const data = await this.getAccessToken()
        writeFileAsync(tokenFilePath, data)
        return Promise.resolve(data)
      })
      .then((res) => {
        this.access_token = res.access_token
        this.expires_in = res.expires_in
        return Promise.resolve(res)
      })
  }

  /**
   * 创建公众号菜单
   */
  async createMenu() {
    const data = await this.fetchAccessToken()
    if (!data.access_token) return
    const url = `${api.createMenu}?access_token=${data.access_token}`
    const res = await axios({
      url,
      method: 'post',
      data: menu,
    })
    console.log(res.data)
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
        const data = await this.fetchAccessToken()
        const url = `${api.deleteMenu}?access_token=${data.access_token}`
        const res = await axios({
          url,
          method: 'get',
        })
        console.log('res', res.data)
        if (res.data.errcode === 0) {
          resolve()
        } else {
          reject()
        }
      } catch (error) {
        reject(error)
      }
    })
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
        const data = await this.fetchAccessToken()
        if (!data.access_token) return

        const res = await axios({
          url: api.getTicket,
          method: 'get',
          params: {
            type: 'jsapi',
            access_token: data.access_token,
          },
        })
        if (res.data.errcode === 0) {
          // console.log("res", res.data);
          let { ticket, expires_in } = res.data
          expires_in = Date.now() + (expires_in - 5 * 60) * 1000
          resolve({ ticket, expires_in })
        } else {
          reject(res.data)
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   *获取当前的ticket
   *
   * @returns
   * @memberof Wechat
   */
  fetchTicket() {
    // 先判断内存中是否有缓存
    const ticketInfo = this.ticketInfo
    if (
      ticketInfo &&
      ticketInfo.expires_in &&
      isValidProperty(ticketInfo, 'ticket')
    ) {
      return Promise.resolve(ticketInfo)
    }
    return readFileAsync(ticketFilePath)
      .then(async (res) => {
        if (isValidProperty(res, 'ticket')) {
          return Promise.resolve(res)
        } else {
          const data = await this.getTicket()
          console.log('getTickData ==> ', data)
          writeFileAsync(ticketFilePath, data)
          return Promise.resolve(data)
        }
      })
      .catch(async (err) => {
        const data = await this.getTicket()
        writeFileAsync(ticketFilePath, data)

        return Promise.resolve(data)
      })
      .then((res) => {
        this.ticketInfo = res
        return Promise.resolve(res)
      })
  }

  /**
   * 获取js-sdk配置config
   * @param {*} reqPath 获取js_sdk的web地址
   */
  getJsSdkConfig(reqPath) {
    return new Promise(async (resolve, reject) => {
      try {
        const { ticket } = await this.fetchTicket()
        const noncestr = Math.random().toString().substring(2)
        const timestamp = Date.now()

        // 参与签名的4个参数，jsapi_ticket（临时票据）、noncestr（随机字符串）、timestamp（时间戳）、url（当前服务器地址）
        const arr = [
          `jsapi_ticket=${ticket}`,
          `noncestr=${noncestr}`,
          `timestamp=${timestamp}`,
          `url=${reqPath}`,
        ]

        // 字典排序
        const paramsStr = arr.sort().join('&')
        // console.log(paramsStr)
        const signature = sha1(paramsStr)
        resolve({
          appId: appID,
          timestamp: timestamp,
          nonceStr: noncestr,
          signature: signature,
          jsApiList: jsApiList,
        })
      } catch (err) {
        reject(err)
      }
    })
  }
}

// 要更新menu的时候，再执行该脚本
// var wechatInstance = new Wechat()
// wechatInstance.createMenu()

module.exports = Wechat
