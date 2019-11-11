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
            username : req.session.user.username
        });
    }
    else {
        res.render('index.ejs', {
            logined : false,
            username : " "
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
            username : req.session.user.username
        });
    }
    else {
        res.render('members.ejs', {
            logined : false,
            username : " "
        });
    }
});

app.get('/research', function(req, res){
   //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('research.ejs', {
            logined : req.session.user.logined,
            username : req.session.user.username
        });
    }
    else {
        res.render('research.ejs', {
            logined : false,
            username : " "
        });
    }
});

app.get('/notice', function (req, res){
    if (req.session.user) {
        res.render('notice.ejs', {
            logined : req.session.user.logined,
            username : req.session.user.username
        });
    }
    else {
        res.render('notice.ejs', {
            logined : false,
            username : " "
        });
    }
});

// post html
app.post('/', function(req, res){
    var userID = req.body.userID;
    var userPassword = req.body.userPassword;
    
    var sql = 'SELECT * FROM user_info WHERE userId = ?';
    connection.query(sql, [userID], function(error, results, fields){
        if(results.length == 0){
            res.render('login.ejs', {alert: true});
        } else{
            var db_pwd = results[0].userPassword;

            if(userPassword == db_pwd){
                //session
                req.session.user = {
                    logined : true,
                    username : results[0].username
                }
                res.render('index.ejs', {
                    logined : req.session.user.logined, 
                    username : req.session.user.username
                });
            } 
            else{
                res.render('login.ejs', {alert: true});
            }
        }
    });
})


// app.post('/login', function(req, res){
//     var name = req.body.name;
//     var pwd = req.body.pwd;
//     var pwdconf = req.body.pwdconf;

//      var sql = "SELECT * FROM user_info WHERE username = ?";
//      connection.query(sql, [name, pwd], function(error, data, fields){
//         connection.query("INSERT INTO user_info VALUES(?,?)", [name, pwd], function(){
//             //console.log(data);
//             res.redirect('/login');
//         });


app.post('/register', function(req, res){
    var username = req.body.username;
    var studentID = req.body.studentID;
    var userID = req.body.userID;
    var userPassword = req.body.userPassword;
    var pwdconf = req.body.pwdconf;
    
    // 학번, username 중복검사 || null 값 들어온 경우 || 비밀번호가 다른경우 
    
    if(userPassword !== pwdconf){
        res.redirect('/register', {alert: true});
    }
    else {
        var sql = 'SELECT * FROM user_info WHERE username = ?';
        connection.query(sql, [username], function(error, results, fields){
            if(results.length == 0){
                connection.query("INSERT INTO user_info VALUES(?,?,?,?)", [username,studentID,userID,userPassword], function(){
                    res.redirect('/login');
                }); 
            }
            else{
                res.render("register.ejs", {alert: true});
            }
        }); 
    }
});
