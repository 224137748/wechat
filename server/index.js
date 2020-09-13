const db = require('../db');
const theaterCrawler = require('./crawler/theatersCrawler');
const savsaveTheaterse = require('./save/saveTheaters');

(async () => {
  // 爬取数据
  const data = await theaterCrawler();

  // 连接数据库
  await db;

  // 存入数据库
  await savsaveTheaterse(data);
})();
