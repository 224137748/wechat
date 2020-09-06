const { url } = require('./index')
/* 公众号菜单栏 */

module.exports = {
  button: [
    {
      type: 'view',
      name: '电影',
      url: `${url}/movie`,
    },
    {
      type: 'view',
      name: '语音识别',
      url: `${url}/search`,
    },
    {
      name: '戳我💋',
      sub_button: [
        {
          type: 'view',
          name: '官网',
          url: 'http://www.findream.vip',
        },
        {
          type: 'click',
          name: '帮助',
          key: 'help',
        },
      ],
    },
  ],
}
