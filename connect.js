// 引入express框架
const express = require('express');
// 引入cors
const cors = require('cors');
// 引入body-parser
const bodyParser = require('body-parser');
const app = express();
// 引入mysql
const mysql = require('mysql');
// router
const router = express.Router()

app.use(cors());
app.use(bodyParser.json()); // json请求
app.use(bodyParser.urlencoded({ extended: false })); // 表单请求

const option = {
    host: 'localhost',
    user: 'root',
    password: 'herogc_0828',
    port: '3306',
    database: 'mydata',
    connectTimeout: 5000,
    multipleStatements: true //是否允许一个query中包含多条sql语句
}

let pool;
reconnect();

function Result({code=200,msg='',data={}}){
    this.code = code;
    this.msg = msg;
    this.data = data;
}
function reconnect(){
    // 启用连接池
    pool = mysql.createPool({
        ...option,
        waitForConnections: true, //没有连接池可用时，ture - 等待 / false - 抛出异常
        connectionLimit: 100, // 连接数限制
        queueLimit: 0 // 最大等待连接数 0 - 不限制
    });
    // 创建连接池
    pool.on('error',err => err.code === 'PROTOCOL_CONNECTION_LOST' && setTimeout(repool,2000))
}
module.exports = {pool,Result,router,app};