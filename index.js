var express = require('express');
var app = express();
var path = require ('path');

app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/public'));

var session = require('express-session');
app.use(session({
    secret: 'sid',
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60
    }
}));

var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    post: 3000,
    password: '',
    database: 'selab'
});

//db 확인
connection.connect(function (err){
    if(err){
        console.error('error connecting: ' + err.stack);
        return;
    }
    console.log('Success DB connection');
});

var server = require('http').createServer(app);

app.listen(3000, function (){
    console.log('Example app listening on port 3000!');
});

// get html(rendering)
app.get('/', function (req, res){
    //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('index.ejs', {
            logined : req.session.user.logined,
            id : req.session.user.id
        });
    }
    else {
        res.render('index.ejs', {
            logined : false,
            id : " "
        });
    }
});

app.get('/login', function (req, res){
    res.render('login.ejs');
});

app.get('/register', function(req, res){
    res.render('register.ejs');
});

app.get('/members', function(req, res){
   //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('members.ejs', {
            logined : req.session.user.logined,
            id : req.session.user.id
        });
    }
    else {
        res.render('members.ejs', {
            logined : false,
            id : " "
        });
    }
});

app.get('/research', function(req, res){
   //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('research.ejs', {
            logined : req.session.user.logined,
            id : req.session.user.id
        });
    }
    else {
        res.render('research.ejs', {
            logined : false,
            id : " "
        });
    }
});

app.get('/notice', function (req, res){
    //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('notice.ejs', {
            logined : req.session.user.logined,
            id : req.session.user.id
        });
    }
    else {
        res.render('notice.ejs', {
            logined : false,
            id : " "
        });
    }
});

// post html
app.post('/', function(req, res){
    var id = req.body.id;
    var pwd = req.body.pwd;
    
    var sql = 'SELECT * FROM user_info WHERE username = ?';
    connection.query(sql, [id], function(error, results, fields){
        if(results.length == 0){
            res.render('login.ejs', {alert: true});
        } else{
            var db_pwd = results[0].password;

            if(pwd == db_pwd){
                //session
                req.session.user = {
                    logined : true,
                    id : id
                }
                res.render('index.ejs', {
                    logined : req.session.user.logined, 
                    id : req.session.user.id
                });
            } else{
                res.render('login.ejs', {alert: true});
            }
        }
    })
})

app.post('/register', function(req, res){
    var id = req.body.id;
    var pwd = req.body.pwd;
    var pwdconf = req.body.pwdconf;
    console.log(id, pwd);
    
    var sql = 'SELECT * FROM user_info WHERE username = ?';
    connection.query(sql, [id,pwd], function(error, data, fileds){
        if(data.length == 0){
            connection.query("INSERT INTO user_info VALUES(?,?)",[id,pwd],function(){
                console.log(data);
                res.redirect('/');
            })
        }
        else{
            console.log("존재");
            res.render("register.ejs",{alert: true});
        }
    });
});
