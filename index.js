// 入口
const {app ,pool,Result} = require('./connect');
const login = require('./login/index');
app.all('*',(req,res,next) => {
    // 全局拦截

    // 继续执行
    next()
})
app.all('/',(req,res) => {
    pool.getConnection((err,conn) => {
        res.json('接口测试')
        // 释放连接池
        conn.release();
    })
})

app.use('/login',login);
// 监听端口
app.listen(8080, ()=> {
    console.log('———————————————— 服务已启动 ———————————————');
})