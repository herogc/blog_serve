// 入口
const {app, Result, pool} = require('./connect');
// 引入插件
const vertoken = require('./token/token')
const expressJwt = require('express-jwt')
const login = require('./login/index');

//解析token获取用户信息
app.use(function(req, res, next) {
    var token = req.headers['authorization'];
    if(token == undefined){
        return next();
    }else{
        vertoken.getToken(token).then((data)=> {
            req.data = data;
            return next();
        }).catch((error)=>{
            return next();
        })
    }
});

//验证token是否过期并规定那些路由不需要验证
app.use(expressJwt({
    secret:'zgs_first_token',
    algorithms:['HS256']
}).unless({
    path:['/login']  //不需要验证的接口名称
}))

//token失效返回信息
app.use(function(err,req,res,next){
    if(err.status==401){
        // return res.status(401).send('token失效')
        return res.json({message:'token失效'})
        //可以设置返回json 形式  res.json({message:'token失效'})
    }
})

//设置托管静态目录; 项目根目录+ public.可直接访问public文件下的文件eg:http://localhost:3000/images/url.jpg
// app.use(express.static(path.join(__dirname, 'public')));

app.all('*',(req,res,next) => {
    // 全局拦截

    // 继续执行
    next()
})
// app.all('/',(req,res) => {
//     pool.getConnection((err,conn) => {
//         res.json('---------接口测试地址--------')
//         // 释放连接池
//         conn.release();
//     })
// })

app.use('/login',login);
// 监听端口
app.listen(8080, ()=> {
    console.log('———————————————— 服务已启动 ———————————————');
})