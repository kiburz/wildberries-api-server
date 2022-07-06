import express from "express";
import mysql from 'mysql';

const router = express.Router();
const connection = mysql.createConnection({
    "host"     : '127.0.0.1',
    "user"     : 'root',
    "password" : 'dk8J9jNT',
    "database" : 'wildberries'
})

async function DBRequest(request: string): Promise<string | void> {
    return new Promise((resolve, reject) => {
        connection.query(request, function (error, results, fields) {
            if (error) reject(error)
            resolve(results)
        });
    })
}

function SendError(res: any, ErrorMessage: string): void {

}

router.get('/', async (req, res, next) => {
    res.send(await DBRequest("SELECT * FROM `users`"));
});

router.get('/deleteUser', async (req, res, next) => {
    if (!req.query.userid) {
        SendError(res, "Введите корректный userid")
        return;
    }

    // const users = await DBRequest(`SELECT * FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)})
    const users = await DBRequest(`SELECT * FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`) as string
    if (users.length === 0) {
        SendError(res, "Такого пользователя не существует.")
        return;
    }
    await DBRequest(`DELETE FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`);
});

module.exports = router;