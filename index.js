var express = require('express');
var app = express();
var path = require ('path');

app.set('views', __dirname + '/public/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static(__dirname + '/public'));

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

app.listen(3000, function (){
    console.log('Example app listening on port 3000!');
});

// get html(rendering)
app.get('/', function (req, res){
    res.render('index.html');
});

app.get('/login', function (req, res){
    res.render('login.html');
});

app.get('/register', function(req, res){
   res.render('register.html'); 
});

app.get('/members', function(req, res){
   res.render('members.html'); 
});

app.get('/research', function(req, res){
   res.render('research.html'); 
});

// post html
app.post('/', function(req, res){
    var name = req.body.name;
    var pwd = req.body.pwd;
    
    var sql = 'SELECT * FROM user_info WHERE username = ?';
    connection.query(sql, [name], function(error, results, fields){
        if(results.length == 0){
            res.render('index.html');
        } else{
            var db_pwd = results[0].password;

            if(pwd == db_pwd){
                res.render('index.html');
            } else{
                res.render('login.html');
            }
        }
    })
})

app.post('/login', function(req, res){
    var name = req.body.name;
    var pwd = req.body.pwd;
    var pwdconf = req.body.pwdconf;

     var sql = "SELECT * FROM user_info WHERE username = ?";
     connection.query(sql, [name, pwd], function(error, data, fields){
        connection.query("INSERT INTO user_info VALUES(?,?)", [name, pwd], function(){
            //console.log(data);
            res.redirect('/login');
        });
    });
});