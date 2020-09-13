// 引入mongoose
const mongoose = require('mongoose');

// 获取Schema
const Schema = mongoose.Schema;

// 创建约束对象
const theaterSchema = new Schema({
  doubanId: {
    type: Number,
    unique: true,
  },
  title: String,
  score: Number,
  star: Number,
  release: Number,
  duration: String,
  region: String,
  director: String,
  actors: String,
  category: String,
  poster: String,
  href: String,
  genre: Array[String],
  summary: String,
  posterKey: String, // 图片上传到七牛中返回的key
  createTime: {
    type: Date,
    default: Date.now(),
  },
});

// 创建模型对象
const Theaters = mongoose.model('Theaters', theaterSchema);

// 对外暴露
module.exports = Theaters;
