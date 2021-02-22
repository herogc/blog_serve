const {pool ,router,Result} = require('../connect');
router.get('/',(req,res) => {
    // conn -- 获取连接对象
    pool.getConnection((err,conn) => {
        conn.query('SELECT * FROM user',(e,r)=>res.json(new Result({data:r})));
        conn.release();
    })
})
module.exports = router;