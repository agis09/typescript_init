import express from 'express'
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  console.log(JSON.stringify(req.user, null, '  '));
  res.render('index', { uid: (req?.user as any)?.nameID });
});

module.exports = router;
export default router;
