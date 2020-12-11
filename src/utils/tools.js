const fs = require('fs')
const { parseString } = require('xml2js')
const { resolve } = require('path')
module.exports = {
  /**
   *解析post数据流
   *
   * @param {*} req expores req
   * @returns xml_data
   */
  getUserDataAsync(req) {
    return new Promise((resolve, reject) => {
      let xmlData = ''
      req.on('data', (data) => {
        xmlData += data.toString()
      })

      req.on('end', () => {
        resolve(xmlData)
      })
    })
  },

  /**
   *解析xmlData
   *
   * @param {*} xmlData
   * @returns Json格式数据
   */
  parseXMLAsync(xmlData) {
    return new Promise((resolve, reject) => {
      parseString(xmlData, { trim: true }, (err, data) => {
        if (!err) {
          resolve(data)
        } else {
          reject('parseXMLAsync解析数据错误' + err)
        }
      })
    })
  },

  /**
   *格式化jsData
   *
   * @param {Object} jsData
   * @returns
   */
  formateMessage(jsData) {
    const message = {}
    jsData = jsData.xml

    if (typeof jsData === 'object') {
      for (let key in jsData) {
        const value = jsData[key]
        if (Array.isArray(value) && value.length > 0) {
          message[key] = value[0]
        }
      }
    }

    return message
  },

  /**
   * 存储本地文件
   * @param {string} path 存储文件路径
   * @param {object} data 存储数据
   */
  writeFileAsync(path, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, JSON.stringify(data), (err) => {
        if (!err) {
          resolve()
        } else {
          reject(`保存文件出错： ${err}`)
        }
      })
    })
  },

  /**
   * 读取文件
   * @param {string} path 文件路径
   */
  readFileAsync(path) {
    return new Promise((resolve, reject) => {
      fs.readFile(path, (err, res) => {
        if (!err) {
          try {
            const data = JSON.parse(res)
            // console.log('read_file', data)
            resolve(data)
          } catch (error) {
            reject(`读取${path}文件失败：` + error)
          }
        } else {
          reject(`读取${path}文件失败：` + err)
        }
      })
    })
  },

  /**
   * 判断对象的某个属性是否过期
   * @param {obj} data
   * @param {string} property
   * @param {'expires_in'} expires
   */
  isValidProperty(data, property, expires = 'expires_in') {
    if (!data && !datap[property] && !data[expires]) return false

    return data[expires] > Date.now()
  },
}
