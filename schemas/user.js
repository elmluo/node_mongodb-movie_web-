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
    // bcrypt.genSalt(saltRounds, function(err, salt) {
    //     var user = this;
    //     if(err) return next(err);
    //     bcrypt.hash(user.password, salt, function(err, hash) {
    //         // Store hash in your password DB.
    //         if (err) return next(err);
    //         user.password = hash;
    //         next();
    //     });
    // });
    next();
});

userSchema.statics = {
    fetch: function (callback) {
        return this.find({}).sort('meta.updateAt').exec(callback)
    },
    findOne: function (name, callback) {
        return this.findOne({name:name}).exec(callback)
    }
};

module.exports = userSchema;