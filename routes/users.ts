import express from "express";
import mysql from 'mysql';
import request from "request";

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
    res.send(await DBRequest("SELECT * FROM `users`"));
});

router.post('/', async (req, res, next) => {
    if (!req.query.name || !req.query.api_key || !req.query.surname) {
        SendError(res, "Введите корректный name, surname и api_key")
        return;
    }

    await DBRequest(`INSERT INTO \`users\` (\`name\`, \`api_key\`, \`surname\`) VALUES ('${req.query.name}', '${req.query.api_key}', '${req.query.surname}')`).then(() => {
        SendNotification(res, "Пользователь создан")
    });

    const options = {
        'method': 'POST',
        'url': `http://89.223.65.34:3000/reports?api_key=${req.query.api_key}`,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error) throw new Error(error);
    });
});

router.put('/', async (req, res, next) => {
    if (req.query.userid && (req.query.name || req.query.surname || req.query.api_key)) {
        console.log(req.query)
        const user = await DBRequest(`SELECT * FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`) as string
        if (user.length === 0) {
            SendError(res, "Такого пользователя не существует.")
            return;
        }
        if (req.query.name)
            await DBRequest(`UPDATE \`users\` SET \`name\` = '${req.query.name}' WHERE  \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`)
        if (req.query.surname)
            await DBRequest(`UPDATE \`users\` SET \`surname\` = '${req.query.surname}' WHERE  \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`)
        if (req.query.api_key)
            await DBRequest(`UPDATE \`users\` SET \`api_key\` = '${req.query.api_key}' WHERE  \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`)

        SendNotification(res, "Пользователь обновлен.")
    } else {
        SendError(res, "Введите корректные данные для изменения пользователя")
        return;
    }
});

router.delete('/', async (req, res, next) => {
    if (!req.query.userid) {
        SendError(res, "Введите корректный userid")
        return;
    }

    const users = await DBRequest(`SELECT * FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`) as string
    if (users.length === 0) {
        SendError(res, "Такого пользователя не существует.")
        return;
    }
    await DBRequest(`DELETE FROM \`reports\` WHERE \`reports\`.\`userid\` = ${parseInt(req.query.userid as string)}`)
    await DBRequest(`DELETE FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`).then(() => {
        SendNotification(res, "Пользователь удален")
    });
});

router.put('/lock', async (req, res, next) => {
    if (!req.query.userid) {
        SendError(res, "Введите корректный userid")
        return;
    }

    const users = await DBRequest(`SELECT * FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`) as string
    if (users.length === 0) {
        SendError(res, "Такого пользователя не существует.")
        return;
    }
    await DBRequest(`UPDATE \`users\` SET \`blocked\` = 1 WHERE  \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`).then(() => {
        SendNotification(res, "Пользователь заблокирован")
    });
});

router.put('/unlock', async (req, res, next) => {
    if (!req.query.userid) {
        SendError(res, "Введите корректный userid")
        return;
    }

    const users = await DBRequest(`SELECT * FROM \`users\` WHERE \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`) as string
    if (users.length === 0) {
        SendError(res, "Такого пользователя не существует.")
        return;
    }
    await DBRequest(`UPDATE \`users\` SET \`blocked\` = 0 WHERE  \`users\`.\`userid\` = ${parseInt(req.query.userid as string)}`).then(() => {
        SendNotification(res, "Пользователь разблокирован")
    });
});

module.exports = router;