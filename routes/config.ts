import express from "express";
import mysql from "mysql";
const router = express.Router();

const connection = mysql.createConnection({
    "host"     : '127.0.0.1',
    "user"     : 'root',
    "password" : 'dk8J9jNT',
    "database" : 'wildberries'
})

async function DBRequest(request: string): Promise<any | void> {
    return new Promise((resolve, reject) => {
        connection.query(request, function (error, results, fields) {
            if (error) reject(error)
            resolve(results)
        });
    })
}

router.post('/', async (req, res, next) => {
    const timeData = req.query.timeData ? Math.abs(parseInt(req.query.timeData as string)) : 1
    const timeType = parseInt(req.query.timeType as string)
    const value = timeType / timeData

    await DBRequest(`UPDATE \`config\` SET \`value\`=${value} WHERE \`config\`.\`configid\` = 1;`)

    res.send({
        value: value
    });
});

module.exports = router;
