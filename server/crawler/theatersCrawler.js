const puppeteer = require('puppeteer');

// 爬取热门电影网址
const url = 'https://movie.douban.com/cinema/nowplaying/chengdu/';

module.exports = async () => {
  // 1、打开浏览器
  // 2、创建tab标签页
  // 3、跳转到指定网址
  // 4、等待网址加载完成，爬取数据
  // 5、关闭浏览器

  const browser = await puppeteer.launch({
    headless: true,
    // args: ['--no-sandbox']
  });

  const page = await browser.newPage();
  await page.goto(url, {
    waitUntil: 'networkidle2', // 等待网络空闲时加载
  });

  // 开始爬取数据
  const results = await page.evaluate(() => {
    const result = [];
    // 页面dom操作
    const $list = $('#nowplaying .lists .list-item');

    for (let i = 0; i < 8; i++) {
      const liDom = $list[i];

      result.push({
        title: $(liDom).data('title'),
        score: $(liDom).data('score'),
        star: $(liDom).data('star'),
        release: $(liDom).data('release'),
        duration: $(liDom).data('duration'),
        region: $(liDom).data('region'),
        director: $(liDom).data('director'),
        actors: $(liDom).data('actors'),
        category: $(liDom).data('category'),
        poster: $(liDom).find('.ticket-btn img').attr('src'),
        href: $(liDom).find('.ticket-btn').attr('href'),
      });
    }

    return result;
  });
  console.log(results);
  for (let i = 0; i < results.length; i++) {
    let item = results[i];
    console.log(item);
    await page.goto(item.href, {
      waitUntil: 'networkidle2',
    });

    const { genre, summary } = await page.evaluate(() => {
      const genre = [];
      const $span = $('#info').find('span[property*=genre]');

      for (let i = 0; i < $span.length; i++) {
        genre.push($span[i].innerText);
      }
      const summary = $('#link-report').find('span[property*=summary]').text();

      return {
        genre,
        summary,
      };
    });
    item.genre = genre;
    item.summary = summary;
  }

  console.log(results);

  await page.screenshot({ path: 'example.png' });

  await browser.close();
};
