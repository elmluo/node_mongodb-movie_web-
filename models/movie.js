/**
 * Created by Administrator on 2016/9/13.
 */
var mongoose = require('mongoose'); // 引入mongoose模块。
var MovieSchema = require("../schemas/movie.js"); //引入定义好的schema模块
var Movie = mongoose.model('Movie',MovieSchema); // 通过mongoose.model来将模式编译成模型

module.exports = Movie; // 导出模型
