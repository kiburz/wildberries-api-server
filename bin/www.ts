import request from "request";

const app = require('../app');
const debug = require('debug')('wildberries-api:server');
const http = require('http');

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

async function HTTPRequest(options: any): Promise<any | void> {
    return new Promise((resolve, reject) => {
        request(options, function (error: any, response: any) {
            if (error) reject(error)
            resolve(response.body)
        })
    })
}

const server = http.createServer(app);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(value: string) {
    const port = parseInt(value, 10);

    if (isNaN(port)) {
        return value;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}


async function AutoUpdating() {
    console.log("Autoupdating")
    setInterval(async () => {
            await Update()
        },
        1800000)
    async function Update() {
        const date = new Date()
        const weekDay = date.getDay()
        const textDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`
        const lastweekTextDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate() - 7).toString().padStart(2, "0")}`
        console.log(date)
        if (weekDay >= 1 && weekDay <= 3) {
            const users = await HTTPRequest({
                'method': 'GET',
                'url': 'http://81.163.27.78/users'
            })
            console.log(users)
            for (const user of users) {
                console.log(user.api_key)
                await HTTPRequest({
                    'method': 'POST',
                    'url': `http://81.163.27.78/reports/?api_key=${user.api_key}&dateFrom=${lastweekTextDate}&dateTo=${textDate}&limit=100000&rrdid=0`
                })
            }
        }
    }
}

async function onListening() {
    await AutoUpdating()
    const address = server.address();
    const bind = typeof address === 'string'
        ? 'pipe ' + address
        : 'port ' + address.port;
    debug('Listening on ' + bind);
}
