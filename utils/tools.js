const { parseString } = require("xml2js");

module.exports = {
  /**
   *解析post数据流
   *
   * @param {*} req expores req
   * @returns xml_data
   */
  getUserDataAsync(req) {
    return new Promise((resolve, reject) => {
      let xmlData = "";
      req.on("data", (data) => {
        xmlData += data.toString();
      });

      req.on("end", () => {
        resolve(xmlData);
      });
    });
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
          resolve(data);
        } else {
          reject("parseXMLAsync解析数据错误" + err);
        }
      });
    });
  },

  /**
   *格式化jsData
   *
   * @param {Object} jsData
   * @returns
   */
  formateMessage(jsData) {
    const message = {};
    jsData = jsData.xml;

    if (typeof jsData === "object") {
      for (let key in jsData) {
        const value = jsData[key];
        if (Array.isArray(value) && value.length > 0) {
          message[key] = value[0];
        }
      }
    }

    return message;
  },
};
