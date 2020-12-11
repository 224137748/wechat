module.exports = (options) => {
  let replayMessage = `<xml>
  <ToUserName><![CDATA[${options.toUserName}]]></ToUserName>
  <FromUserName><![CDATA[${options.fromUserName}]]></FromUserName>
  <CreateTime>${options.createTime}</CreateTime>
  <MsgType><![CDATA[${options.msgType}]]></MsgType>
 `;
  switch (options.msgType) {
    case "text":
      replayMessage += `<Content><![CDATA[${options.content}]]></Content>`;
      break;
    case "image":
      replayMessage += `<Image><MediaId><![CDATA[${options.mediaId}]]></MediaId></Image>`;
      break;
    case "voice":
      replayMessage += `<Voice><MediaId><![CDATA[${options.mediaId}]]></MediaId></Voice>`;
      break;
    case "video":
      replayMessage += ` <Video><MediaId><![CDATA[${options.mediaId}]]></MediaId><Title><![CDATA[${options.title}]]></Title><Description><![CDATA[${options.description}]]></Description></Video>`;
      break;
    case "music":
      replayMessage += `<Music>
    <Title><![CDATA[${options.title}]]></Title>
    <Description><![CDATA[${options.description}]]></Description>
    <MusicUrl><![CDATA[${options.musicUrl}]]></MusicUrl>
    <HQMusicUrl><![CDATA[${options.hqMusicUrl}]]></HQMusicUrl>
    <ThumbMediaId><![CDATA[${options.mediaId}]]></ThumbMediaId>
  </Music>`;
      break;
    case "news":
      replayMessage += `<ArticleCount>${options.content.length}</ArticleCount><Articles>`;
      options.content.forEach((data) => {
        replayMessage += `<item>
      <Title><![CDATA[${data.title}]]></Title>
      <Description><![CDATA[${options.description}]]></Description>
      <PicUrl><![CDATA[${options.picUrl}]]></PicUrl>
      <Url><![CDATA[${options.url}]]></Url>
    </item>`;
      });
      replayMessage += `</Articles>`;
      break;
  }

  return (replayMessage += "</xml>");
};
