import express from "express";
const router = express.Router();

router.post('/', function(req, res, next) {
    const timeData = req.query.timeData
    const timeType = req.query.timeType

    // TODO: Добавить подключенную в app.ts базу данных и менять там конфигурацию

    res.send({
        timeData: timeData,
        timeType: timeType
    });
});

module.exports = router;
