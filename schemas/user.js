var mongoose = require('mongoose');
var bcrypt = require('bcryptjs'); //加盐hash模块
var saltRounds = 10;
// var myPlaintextPassword = 's0/\/\P4$$w0rD';
// var someOtherPlaintextPassword = 'not_bacon';

var userSchema = new mongoose.Schema({
    name: {
        unique: true,
        type: String
    },
    password: {
        unique: true,
        type: String
    },
    meta: {
        createAt: {
            type: Date,
            default: Date.now()
        },
        updateAt: {
            type: Date,
            default: Date.now()
        }
    }
});

userSchema.pre('save', function (next) {
    // this上下文传入schema实例模式对象。
    if (this.isNew) {
        this.meta.createAt = this.meta.updateAat = Date.now()
    }
    else {
        this.meta.updateAt = Date.now()
    }

    // 加盐hash用户密码
    // this 是个坑
    var user = this;

    console.log(user);
    bcrypt.genSalt(saltRounds, function (err, salt) {
        console.log(user.password);
        if (err) return next(err);
        bcrypt.hash(user.password, salt, function (err, hash) {
            // Store hash in your password DB.
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
    // next();
});
// 定义实例的方法
userSchema.methods = {
    comparePasswordByBcrypt: function (_password, callback) {
        var hashedPassword = this.password;
        bcrypt.compare(_password, hashedPassword, function (err, isMatch) {
            if (err) return callback(err);
            callback && callback(null, isMatch);
        })
    },
    comparePassword: function (_password, callback) {
        var isMatch = true;
        if (_password !== this.password) {
            return console.log("后台没有匹配到数据库中用户密码");
        } else {
            callback(isMatch);
        }
    }
};

// 定义模式的静态方法
userSchema.statics = {
    fetch: function (callback) {
        return this.find({}).sort('meta.updateAt').exec(callback)
    }
};

module.exports = userSchema;