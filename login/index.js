const {pool ,router,Result} = require('../connect');
router.post('/', function(req, res, next) {
    // conn -- 获取连接对象
    pool.getConnection((err,conn) => {
        const data = {
            'username': req.body.userName,
            'password': req.body.passWord
        }
        const sql = `select * from user where username = '${data.username}' and password = '${data.password}'`
        conn.query(sql,(e,r)=>res.json(new Result({data:r})));
        conn.release();
    })
});
module.exports = router;
// 表单参数会放到req.query里，路径上的参数会放到req.params里，json参数会放到req.body