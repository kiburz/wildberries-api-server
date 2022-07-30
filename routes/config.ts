import express from "express";
import mysql from "mysql";
import request from "request";
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

async function HTTPRequest(options: any) {
    return new Promise((resolve, reject) => {
        request(options, function (error: any, response: any) {
            if (error) reject(error)
            resolve(response.body)
        })
    })
}

router.post('/', async (req, res, next) => {
    const timeData = req.query.timeData ? Math.abs(parseInt(req.query.timeData as string)) : 1
    const timeType = parseInt(req.query.timeType as string)
    const value = timeType / timeData

    await DBRequest(`UPDATE config SET value=${value} WHERE config.configid = 1;`)

    res.send({
        value: value
    });

    setInterval(async () => {
        await HTTPRequest(
        {
            'method': 'POST',
            'url': `http://89.223.65.34:3000/reports?api_key=ZTcyMWYxNjUtYTg4Ny00ZmU1LTliZTItZGI5ZjA4OTg1MGIy`,
            'headers': {
                'Access-Control-Allow-Private-Network': 'true'
            }
        })
    }, value)
});

module.exports = router;
