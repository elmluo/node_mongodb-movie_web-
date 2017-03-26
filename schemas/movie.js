/**
 * Created by Administrator on 2016/9/13.
 */
var mongoose = require('mongoose'); //引入mongoose模块
var MovieSchema = new mongoose.Schema({ // 创建schema对象
    doctor:String,
    title:String,
    language:String,
    country:String,
    summary:String,
    flash:String,
    poster:String,
    year:String,
    meta:{ // 记录的时间戳
        createAt:{ // 创建时间
            type:Date,
            default:Date.now()
        },
        updateAt:{ // 跟新时间
            type:Date,
            default:Date.now()
        }
    }
});

// 创建一个方法，pre监听，每一次存储数据之前都会调用这个方法，判断这个数据是否是新加的
MovieSchema.pre('save',function(next){ //
    if(this.isNew){ //判断数据是否是新加，如果新加的话，将add时间和update时间变成当前时间
        this.meta.createAt = this.meta.updateAat = Date.now()
    }
    else{ // 如果是跟新数据的话，将跟新时间变成当前时间
        this.meta.updateAt = Date.now()
    }
    next() //调用next方法才会将存储流程走下去
});

// 创建数据库查询静态方法，这些静态方法不会直接和数据库进行交互，只有通过model模型编译才会具有这个方法
MovieSchema.statics = {
    fetch: function (callback) { // 封装一个查询数据库所有数据的一个方法
        return this
            .find({}) // 查询所有
            .sort('meta.updateAt') // 按照更新时间排序
            .exec(callback); // 执行回调
    },
    findById: function (id, callback) {  // 封装一个根据id来查询单条数据的方法。
        return this
            .findOne({_id: id})
            .exec(callback); // 执行回调
    }
};

module.exports = MovieSchema; // 导出模式 然后去写模型的js代码