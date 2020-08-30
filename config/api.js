const baseUrl = `https://api.weixin.qq.com/cgi-bin`;

/**
 * 获取access_token
 */
const getAccessToken = `${baseUrl}/token`;

/**
 * 创建菜单栏
 */
const createMenu = `${baseUrl}/menu/create`;

/**
 * 删除菜单栏
 */
const deleteMenu = `${baseUrl}/menu/delete`;

/**
 * 获取js_sdk接口
 */
const getTicket = `${baseUrl}/ticket/getticket`;

module.exports = {
  getAccessToken,
  createMenu,
  deleteMenu,
  getTicket,
};
