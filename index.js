/**
 * Created by Administrator on 2016/9/12.
 */
var express = require("express");
var path = require('path');
var mongoose = require('mongoose'); // 引入mongoose模块
var _ = require('underscore'); // underscore模块用来新字段替换久字段。
var Movie = require('./models/movie'); // 引入刚才编译好schema模式的模型
var port = process.env.PORT || 3000;
var app = express();

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/movies"); // 连接我们数据库

app.use(require('body-parser').urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));//静态文件配置的目录
app.set('views','./views/pages');
app.set('view engine','pug');
app.locals.moment = require('moment'); // 对于一个事件格式的方法
app.listen(port);

console.log('imooc start:'+ port);

//index page
app.get('/',function(req,res){
    Movie.fetch(function (err, movies) {  // 使用模型当中的方法
        if(err){
            console.log(err);
        }

        res.render('index',{ // 渲染首页的模板
            title:'imooc 首页',
            movies: movies
        });
    })
} );

//detail page
app.get('/movie/:id', function(req, res) {
    var id = req.params.id; // 拿到请求参数当中的:id 
    Movie.findById(id,function (err, movie) { // 在模式当中定义好的静态方法 实现查询
        if(err){
            console.log(err);
        }

        // 通过res下面的render方法，将详情页返回出去。
        res.render('detail', 
            { // 给返回内容添加配置参数
                title: 'express ' + movie.title,
                movie: movie
            })
    })
})

//admin page 后台录入页
app.get('/admin/movie', function(req, res) {
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
})

//admin update movie 更新的时候。需要将跟新的列表页也初始化到我们后台录入页面的表单中。
app.get('/admin/update/:id',function (req, res) {
    var id= req.params.id;

    if (id) {
        Movie.findById(id, function (err,movie) {
            res.render('admin',
            {
                title:'node 后台更新页',
                movie:movie
            })

        })
    }
})

//admin post movie 拿到从录入页面post过来的数据
app.post('/admin/movie/new',function (req, res) {
    var id = req.body.movie._id; // post请求体里面时候有id的定义
    var movieObj = req.body.movie; // 在请求体里面拿到这个这个movie对象
    var _movie ;
    if(id!==undefined && id !== "" && id !== null){ // 通过id来判断记录是否存在。没有就添加，老的就跟新
        Movie.findById(id,function (err,movie) { // 通过id查找记录
            if (err) {
                console.log(err);
            }

            _movie = _.extend(movie, movieObj); // underscore的extend方法来替换字段
            _movie.save(function (err,movie) { // save保存记录，在save的回调方法里面依然可以拿到err是否有异常，和保存后的movie。
                if (err){
                    console.log(err);
                }

                res.redirect('/movie/' + movie._id) // 如果保存成功了，让路由重定向到我们的详情页面
            })
        })
    }else{ // 如果这个记录是新的。就给他传入一个新的电影数据。
        _movie = new Movie({
            doctor:movieObj.doctor,
            title:movieObj.title,
            country:movieObj.country,
            language:movieObj.language,
            year:movieObj.year,
            poster:movieObj.poster,
            summary:movieObj.summary,
            flash:movieObj.flash
        });

        _movie.save(function (err,movie) { // 这里和前面的处理是一样的。
            if (err){
                console.log(err);
            }

            res.redirect('/movie/' + movie._id)
        })
    }
});


//list page
app.get('/admin/list', function(req, res) {
    Movie.fetch(function (err, movies) { // 调用查询方法
        if(err){
            console.log(err);
        }

        res.render('list',{
            title:'imooc 列表页',
            movies: movies
        });
    });
});