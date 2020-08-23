/* 处理要回复的消息类型 */

// 处理text回复消息
const buildTextReply = (options, message, text) => {
  if (text) {
    options.content = text;
    return;
  }

  const content = message.Content;
  if (content === "1") {
    options.content = "大吉大利，今晚吃鸡";
  } else if (content === "2") {
    options.content = "落地成盒";
  } else if (content.match("爱")) {
    options.content = "我爱你~！";
  } else {
    options.content = "瓜娃子";
  }
};

// 处理image消息回复
const buildImageReply = (options, message) => {
  options.msgType = "image";
  options.mediaId = message.MediaId;
};

// 处理voice消息回复
const buildVoiceReply = (options, message) => {
  options.msgType = "voice";
  options.mediaId = message.MediaId;
};

// 处理location消息回复
const buildLocationReply = (options, message) => {
  options.content = `维度为：${message.Location_X};经度为：${message.Location_Y};地理位置信息：${message.Label}`;
};

// 处理event消息回复
const buildEventReply = (options, message) => {
  switch (message.Event) {
    case "subscribe":
      buildTextReply(options, message, "欢迎您的关注~!");
      break;
    case "unsubscribe":
      console.log("无情取关~！");
  }
};
module.exports = (message) => {
  let options = {
    toUserName: message.FromUserName,
    fromUserName: message.ToUserName,
    createTime: Date.now(),
    msgType: "text",
  };

  switch (message.MsgType) {
    case "text":
      buildTextReply(options, message);
      break;
    case "image":
      buildImageReply(options, message);
      break;
    case "voice":
      buildVoiceReply(options, message);
      break;
    case "location":
      buildLocationReply(options, message);
      break;
    case "event":
      buildEventReply(options, message);
      break;
    default:
      options.content = `I am sorry ~! I don't know what you say!`;
  }
  console.log(options);
  return options;
};
