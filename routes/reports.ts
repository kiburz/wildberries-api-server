import express from "express";
import mysql from 'mysql';
import request from 'request';

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

function SendError(res: any, ErrorMessage: string): void {
    res.send({
        error: ErrorMessage
    })
}

function SendNotification(res: any, NotificationMessage: string): void {
    res.send({
        notification: NotificationMessage
    })
}

router.get('/', async (req, res, next) => {
    res.send(await DBRequest("SELECT * FROM `reports`"));
});

router.post('/', async (req, res, next) => {
    // await DBRequest("TRUNCATE TABLE `reports`")
    if (!req.query.api_key) {
        SendError(res,"Введите корректный api_key")
        return;
    }
    const date = new Date()
    const normalDate = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    const response = await HTTPRequest(
    {
        'method': 'GET',
        'url': `https://suppliers-stats.wildberries.ru/api/v1/supplier/reportDetailByPeriod?key=${req.query.api_key}&dateFrom=2020-06-01&dateTo=${normalDate}&limit=100000&rrdid=0`,
    }) as any

    const users = await DBRequest(`SELECT * FROM \`users\` WHERE \`users\`.\`api_key\` = '${req.query.api_key}'`) as any
    if (users.length === 0) {
        SendError(res, "Пользователя с таким api_key не существует")
        return;
    }

    for await (const element of response) {
        await DBRequest(`INSERT INTO \`reports\` (\`userid\`, \`body\`) VALUES (${users[0].userid}, '${JSON.stringify(element)}')`)
    }
    res.send({
        notification: "Отчет добавлен в базу данных",
        userid: users.userid,
        body: response
    })
});

module.exports = router;