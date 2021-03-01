//引入token 
const vertoken = require('../token/token');
const sqlobj = require('../db/sql');
const {pool ,router,Result} = require('../connect');
router.post('/', function(req, res, next) {
    // conn -- 获取连接对象
    pool.getConnection((err,conn) => {
        const params = [ req.body.userName,req.body.passWord ]
        if (params[0] === '' || params[1] === '') {
            return res.json({
                code: 1,
                message: '账户或密码不能为空'
            }) 
        } else {  
            // 查询数据是否存在数据库中(sql参数替换多个 ?  ---> []数组)
            conn.query(sqlobj.sqls.login, params, function (err, result) {
                if(err){
                    throw err;
                } else {
                    if(result.length !== 0){
                        console.log(result)
                        //调用生成token的方法
                        vertoken.setToken(result.username,result.user_id).then(token=>{
                            return  res.json({
                                code: 200,
                                message: '登录成功',
                                token:token,
                                data: result
                                //前端获取token后存储在localStroage中,
                                //**调用接口时 设置axios(ajax)请求头Authorization的格式为`Bearer ` +token
                             })
                        })
                    } else {
                        conn.query(sqlobj.sqls.user, params[0], function (err, data) {
                            const userData = JSON.parse(JSON.stringify(data))
                            if (err) {
                                throw err;
                            } else {
                                console.log(userData)
                                if(userData.length===0){
                                    return res.json({
                                        result:0,
                                        status:10000,
                                        message:'用户不存在'
                                    })
                                }else{
                                    if(params[0] == userData[0].username && params[1] !== userData[0].password){
                                        return res.json({
                                            result:0,
                                            status:10001,
                                            message:"密码错误"
                                        })
                                    }else if(params[0] !== userData[0].username && params[1] === userData[0].password){
                                        return res.json({
                                            result:0,
                                            status:10002,
                                            message:'账户名有误'
                                        })
                                    }else{
                                        return res.json({
                                            result:0,
                                            status:10004,
                                            message:'系统错误'
                                        })
                                    }
                                }
                            }
                        })
                    }
                }
                // res.json(new Result({data:result}))
            });
            conn.release();
        }
    })
});
module.exports = router;
// 表单参数会放到req.query里，路径上的参数会放到req.params里，json参数会放到req.body