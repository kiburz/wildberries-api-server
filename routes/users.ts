import express from "express";
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('users', { title: 'Wildberries API' });
});

module.exports = router;