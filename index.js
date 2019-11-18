var express = require('express');
var app = express();
var path = require ('path');
var XLSX = require('xlsx');

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

//엑셀파일 읽어오기
var workbook = XLSX.readFile('a.xlsx');
var sheet_name_list = workbook.SheetNames;

//엑셀파일 json파일 형태로 변환
var scores = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]]);



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

//엑셀 데이터를 데이터베이스에 넣기
for(var i=0; i<scores.length; i++){
    var idnumber = scores[i]["idnumber"];
    var score = scores[i]["score"];
    var rank = scores[i]["rank"];


    var sql = 'SELECT * form score';
    connection.query(sql, function(error, results, fields){
        connection.query("INSERT INTO score VALUES(?,?,?)", [idnumber,score,rank], function(){
        }); 
    }); 
}

// get html(rendering)
app.get('/', function (req, res){
    //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('index.ejs', {
            logined : req.session.user.logined,
            user_name : req.session.user.user_name
        });
    }
    else {
        res.render('index.ejs', {
            logined : false,
            user_name : " "
        });
    }
});

app.get('/login', function (req, res){
    res.render('login.ejs', {data:true});
});

app.get('/register', function(req, res){
    res.render('register.ejs', {alert: false});
});

app.get('/members', function(req, res){
   //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('members.ejs', {
            logined : req.session.user.logined,
            user_name : req.session.user.user_name
        });
    }
    else {
        res.render('members.ejs', {
            logined : false,
            user_name : " "
        });
    }
});

app.get('/research', function(req, res){
   //console.log(req.session.user);
    if (req.session.user) {
        //console.log(req.session.user.logined, req.session.user.id);
        res.render('research.ejs', {
            logined : req.session.user.logined,
            user_name : req.session.user.user_name
        });
    }
    else {
        res.render('research.ejs', {
            logined : false,
            user_name : " "
        });
    }
});

app.get('/notice', function (req, res){
    var sql = 'SELECT * FROM notice';
    connection.query(sql, function(error, results, fields){
        if (req.session.user) {
            res.render('notice.ejs', {
                logined : req.session.user.logined,
                user_name : req.session.user.user_name,
                results 
            });
        }
        else {
            res.render('notice.ejs', {
                logined : false,
                user_name : " ",
                results
            });
        }
        //console.log(results); 
    });
});

app.get('/notice_insert', function (req, res){
    if (req.session.user) {
        res.render('notice_insert.ejs', {
            logined : req.session.user.logined,
            user_name : req.session.user.user_name
        });
    }
    else {
        res.redirect('/login');
    }
});

app.get('/notice/:notice_id', function (req, res) {

    //db연동해서 id값에 따른 텍스트 보여주기
    var notice_id = req.url.split("/")[2];

    connection.query('UPDATE notice SET view = view + 1 WHERE notice_id = ?', [notice_id]);

    var sql = 'SELECT * FROM notice WHERE notice_id = ?';
    connection.query(sql, [notice_id], function(error, results, fields){
        console.log(results);
        if (req.session.user) {
            res.render('notice_id.ejs', {
                logined: req.session.user.logined,
                user_name: req.session.user.user_name,
                results
            });
        } 
        else {
            res.render('notice_id.ejs', {
                logined: false,
                user_name: " ",
                results
            })
        }
    })
});

// post html
app.post('/notice_insert', function(req, res){
   //db 연동 
    var title = req.body.title;
    var content = req.body.content;
    var writer_name = req.session.user.user_name;
    
    var sql = 'INSERT INTO notice(title, content, writer_name) VALUES (?,?,?)';
    connection.query(sql, [title, content, writer_name], function(error, results, fields){
        res.redirect('/notice');
    });
});

app.post('/', function(req, res){
    var user_id = req.body.user_id;
    var user_password = req.body.user_password;
    
    var sql = 'SELECT * FROM user_info WHERE user_id = ?';
    connection.query(sql, [user_id], function(error, results, fields){
        if(results.length == 0){
            res.render('login.ejs', {alert: true});
        } else{
            var db_pwd = results[0].user_password;

            if(user_password == db_pwd){
                //session
                req.session.user = {
                    logined : true,
                    user_name : results[0].user_name
                }
                res.render('index.ejs', {
                    logined : req.session.user.logined, 
                    user_name : req.session.user.user_name
                });
            } 
            else{
                res.render('login.ejs', {alert: true});
            }
        }
    });
})

app.post('/register', function(req, res){
    var user_name = req.body.user_name;
    var studentid = req.body.studentid;
    var user_id = req.body.user_id;
    var user_password = req.body.user_password;
    var pwdconf = req.body.pwdconf;
    
    // 학번, username 중복검사 || null 값 들어온 경우 || 비밀번호가 다른경우 
    
    if(user_password !== pwdconf){
        res.redirect('/register');
    }
    else {
        var sql = 'SELECT * FROM user_info WHERE user_name = ?';
        connection.query(sql, [user_name], function(error, results, fields){
            if(results.length == 0){
                connection.query("INSERT INTO user_info VALUES(?,?,?,?)", [user_name,studentid,user_id,user_password], function(){
                    res.redirect('/login');
                }); 
            }
            else{
                res.render("register.ejs", {alert: true});
            }
        }); 
    }
});

app.get('/score', function(req, res){
    if(req.session.user){
        res.render('score.ejs', {
            data:false,
            param: false
        });
    }
    else{
        res.render('login.ejs', );
    }
});

var param = true;

var score;
var rank;

app.post('/score', function(req, res){
    var idnum = req.body.IDnumber;
    var sql = 'SELECT * FROM score WHERE idnumber = ?';
    var length;
    connection.query(sql, [idnum], function(error, results, fields){
        if(error){
            console.log("Error");
        }    
        else{
            if(results.length>0){
                score = results[0].score;
                rank = results[0].rank;
                length = results.length;
            }
            if(length == null){
                res.render('score.ejs', {
                    data:false,
                    param : true
                });
            }
            else{
                res.redirect('/score/:data');
            }
        }
    });

});

app.get('/score/:data', function(req,res){
    res.render('score.ejs', {
        data:true,
        score: score,
        rank : rank,
        param: false
    });
});
