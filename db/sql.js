//sql语句
var sqls={
    login: "select * from user where username = ? and password = ?",
    user: "select username,password from user where username = ?",
}

//封装需要token验证的方法，
var conn_query = function (req, res, sql, params) {
    connection.query(sql, params, function (err, result) {
        console.log('-----------')
        if (err) {
            //遇到过的错误（可直接throw err）
            let messageError = '';
            if (err.errno == 1048) {
                messageError = '参数不能为空'
            } else if (err.errno == 1062) {
                messageError = '数据已存在'
            } else if (err.errno == 1265) {
                messageError = '格式错误'
            }
            else {
                messageError = '请求失败'
            }
            return res.json({
                code: err.errno,
                message: messageError
            })
        } else {
            //第二种 改版后req.data 是验证后的返回值 (生成token传的数据)
            if (req.data) {
                return res.json({
                    code: 200,
                    message: '请求成功',
                    data: result
                })
            } else {
                return res.json({
                    code: 1,
                    status: 401,
                    message: "请求异常"
                })
            }
        }
    })
};
//导出
module.exports = {
    sqls,
    conn_query 
}