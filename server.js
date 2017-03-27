/**
 * Created by Administrator on
 */
var express = require("express");
var path = require('path');
var mongoose = require('mongoose'); // 引入mongoose模块
var _ = require('underscore'); // underscore模块用来新字段替换久字段。

/* 数据模型 */
var User = require('./models/user.js');
var Movie = require('./models/movie.js'); // 引入刚才编译好schema模式的模型

var port = process.env.PORT || 3000; // 设置端口
var app = express();

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/lcmovies"); // 连接我们数据库，数据库的名字lcMovies

app.use(require('body-parser').urlencoded({extended: true})); // 插件，将formpost过来body体转换成一个对象
app.use(express.static(path.join(__dirname, 'public')));// 静态文件配置的目录
app.set('views', './views/pages'); // 找到对应需要返回给前段的页面
app.set('view engine', 'pug'); // 设置模板引擎
app.locals.moment = require('moment'); // 对于一个时间格式的方法
app.listen(port);

console.log('imooc start:' + port);

//index page 首页路由
app.get('/', function (req, res) {
    Movie.fetch(function (err, movies) {  // fectch方法拿到对应数据库的movies数据 传入回调方法。
        if (err) {
            console.log(err);
        }

        res.render('index', { // 传入fetch到的movies数据对象，渲染首页的模板。
            title: 'imooc 首页',
            movies: movies
        });
    })
});

// signup form注册 路由
app.post('/user/signup', function (req, res) {
    var _user = req.body.user;
    var name = _user.name;
    console.log(_user);
    // 判断时候有重复用户名么若有重，返回到首页，没有再保存
    User.find({name: name}, function (err, user) {
        console.log(user);
        if (err) return console.log(err);
        // 返回空数组，if也是true
        if (user.length !== 0) {
            console.log('用户已经注册');
            return res.redirect('/');
        } else {
            var user = new User(_user);
            console.log(user);
            user.save(function (err, user) {
                if (err) console.log(err);
                console.log(user);
                // 数据存储完之后，重定向路由到用于列表页。
                console.log('注册成功');
                res.redirect('/admin/userlist');
            });
        }
    });

});

// signin form 登录 路由
app.post('/user/signin', function (req, res) {
    var _user = req.body.user;
    var name = _user.name;
    var password = _user.password;
    // 直接调用mongoose的findOne方法匹配用户。
    User.findOne({name: name}, function (err, user) {
        if (err) console.log(err);
        // console.log(user);
        if (!user) {
            console.log("用户不存在，请注册！");
            return res.redirect('/');
        }
        // schema中定义实例的methods对象的方法 密码匹配
        user.comparePasswordByBcrypt(password, function (err,isMatch) {
            // console.log(isMatch);
            // if (err) console.log(err);
            if (isMatch) {
                console.log("密码匹配成功, 用户已登录");
                res.redirect('/')
            } else {
                console.log("密码没有匹配");
            }
        })
    });
});

// userlist page 用户信息页列表
app.get('/admin/userlist', function (req, res) {
    User.fetch(function (err, users) {
        if (err) console.log(err);
        res.render('userlist', {
            title: '用户列表',
            users: users
        });
    })
});

//detail page 具体电影详情页面
app.get('/movie/:id', function (req, res) {
    var id = req.params.id; // 拿到请求参数当中的:id 
    Movie.findById(id, function (err, movie) { // 根据参数查询对应数据对象。
        if (err) {
            console.log(err);
        }

        res.render('detail',
            { // 给返回内容给视图模板
                title: 'express ' + movie.title,
                movie: movie
            })
    })
});

//admin page 后台录入页路由
app.get('/admin/addMovie', function (req, res) {
    res.render('admin', {
        title: 'node 后台录入页',
        movie: {
            title: '',
            doctor: '',
            country: '',
            year: '',
            poster: '',
            flash: '',
            summary: '',
            language: ''
        }
    })
});

//admin update movie 后台录入页面form中‘更新link 的路由’
// 更新的时候。需要将更新的列表,也初始化到台录入页form中。
app.get('/admin/update/:id', function (req, res) {
    var id = req.params.id;

    if (id) {
        Movie.findById(id, function (err, movie) {
            res.render('admin',
                {
                    title: 'node 后台更新页',
                    movie: movie
                })

        })
    }
});

//admin post movie 录入页面form提交路由。
// 拿到从录入页面formpost action过来的数据
app.post('/admin/movie/new', function (req, res) {
    var id = req.body.movie._id; // post请求体里面时候有id的定义
    var movieObj = req.body.movie; // 在请求体里面拿到这个这个movie对象
    var _movie;
    // 通过id来判断记录是否存在。没有就添加，老的就跟新
    if (id !== undefined && id !== "" && id !== null) { // 如果id已经存在
        Movie.findById(id, function (err, movie) { // 通过id查找记录
            if (err) {
                console.log(err);
            }

            _movie = _.extend(movie, movieObj); // underscore的extend方法,新对象里面的所有字段，替换老对象里面的所有字段，返回替换后的结果。
            _movie.save(function (err, movie) { // save保存记录，在save的回调方法里面依然可以拿到err是否有异常，和保存后的movie。
                if (err) {
                    console.log(err);
                }

                res.redirect('/movie/' + movie._id) // 如果保存成功了，让路由重定向到我们的详情页面
            })
        })
    } else { // 如果这个记录是新的。就给他传入一个新的电影数据。
        _movie = new Movie({
            doctor: movieObj.doctor,
            title: movieObj.title,
            country: movieObj.country,
            language: movieObj.language,
            year: movieObj.year,
            poster: movieObj.poster,
            summary: movieObj.summary,
            flash: movieObj.flash
        });

        _movie.save(function (err, movie) { // 这里和前面的处理是一样的。
            if (err) {
                console.log(err);
            }

            res.redirect('/movie/' + movie._id)
        })
    }
});


//list page 电影列表路由。
app.get('/admin/list', function (req, res) {
    Movie.fetch(function (err, movies) { // 调用查询方法
        if (err) {
            console.log(err);
        }

        res.render('list', {
            title: 'imooc 列表页',
            movies: movies
        });
    });
});

// list delete movie 列表页过来的删除的请求。
app.delete('/admin/list', function (req, res) {
    var id = req.query.id;
    if (id) {
        Movie.remove({_id: id}, function (err, movie) {
            if (err) {
                console.log(err);
            }
            else {
                res.json({success: 1});
            }
        });
    }
});