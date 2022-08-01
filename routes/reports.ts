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

async function HTTPRequest(options: any): Promise<any | void> {
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
    let reports = await DBRequest("SELECT * FROM reports");
    if (req.query.userid) {
        reports = await DBRequest(`SELECT * FROM reports WHERE userid = ${req.query.userid}`);
    }
    let result = []
    if (req.query.dateFrom && req.query.dateTo) {
        let results = []
        const dateFrom = new Date(req.query.dateFrom as string)
        const dateTo = new Date(req.query.dateTo as string)
        for (const report of reports) {
            const body = JSON.parse(report.body)
            const reportDate = new Date(body.rr_dt)
            if (reportDate >= dateFrom && reportDate <= dateTo)
                results.push(report)
        }
        result = results
    } else {
        result = reports
    }
    res.send(result)
});

router.post('/', async (req, res, next) => {
    if (!req.query.api_key && !req.query.dateFrom && !req.query.dateTo) {
        SendError(res,"Введите корректный api_key, dateFrom, dateTO")
        return;
    }
    const response = await HTTPRequest(
    {
        'method': 'GET',
        'url': `https://suppliers-stats.wildberries.ru/api/v1/supplier/reportDetailByPeriod?key=${req.query.api_key}&dateFrom=${req.query.dateFrom}&dateTo=${req.query.dateTo}&limit=100000&rrdid=0`,
        'headers': {
            'Access-Control-Allow-Private-Network': 'true'
        }
    }) as any

    const users = await DBRequest(`SELECT * FROM users WHERE users.api_key = '${req.query.api_key}'`) as any
    if (users.length === 0) {
        SendError(res, "Пользователя с таким api_key не существует")
        return;
    }
    SendNotification(res, "Отчеты обновлены")
    const reports = JSON.parse(response as string)
    console.log(reports)
    for (let x = 0; x < reports.length; x++) {
        const parsedReport = {
            realizationreport_id: reports[x].realizationreport_id,
            suppliercontract_code: reports[x].suppliercontract_code,
            rrd_id: reports[x].rrd_id,
            gi_id: reports[x].gi_id,
            subject_name: reports[x].subject_name,
            nm_id: reports[x].nm_id,
            brand_name: reports[x].brand_name,
            sa_name: reports[x].sa_name,
            ts_name: reports[x].ts_name,
            barcode: reports[x].barcode,
            doc_type_name: reports[x].doc_type_name,
            quantity: reports[x].quantity,
            retail_price: reports[x].retail_price,
            retail_amount: reports[x].retail_amount,
            sale_percent: reports[x].sale_percent,
            commission_percent: reports[x].commission_percent,
            office_name: reports[x].office_name,
            supplier_oper_name: reports[x].supplier_oper_name,
            order_dt: reports[x].order_dt,
            sale_dt: reports[x].sale_dt,
            rr_dt: reports[x].rr_dt,
            shk_id: reports[x].shk_id,
            retail_price_withdisc_rub: reports[x].retail_price_withdisc_rub,
            delivery_amount: reports[x].delivery_amount,
            return_amount: reports[x].return_amount,
            delivery_rub: reports[x].delivery_rub,
            gi_box_type_name: reports[x].gi_box_type_name,
            product_discount_for_report: reports[x].product_discount_for_report,
            supplier_promo: reports[x].supplier_promo,
            rid: reports[x].rid,
            ppvz_spp_prc: reports[x].ppvz_spp_prc,
            ppvz_kvw_prc_base: reports[x].ppvz_kvw_prc_base,
            ppvz_kvw_prc: reports[x].ppvz_kvw_prc,
            ppvz_sales_commission: reports[x].ppvz_sales_commission,
            ppvz_for_pay: reports[x].ppvz_for_pay,
            ppvz_reward: reports[x].ppvz_reward,
            ppvz_vw: reports[x].ppvz_vw,
            ppvz_vw_nds: reports[x].ppvz_vw_nds,
            ppvz_office_id: reports[x].ppvz_office_id,
            ppvz_office_name: reports[x].ppvz_office_name,
            ppvz_supplier_id: reports[x].ppvz_supplier_id,
            ppvz_supplier_name: reports[x].ppvz_supplier_name.replace('\"', ''),
            ppvz_inn: reports[x].ppvz_inn,
            declaration_number: reports[x].declaration_number,
            sticker_id: reports[x].sticker_id,
            site_country: reports[x].site_country,
            penalty: reports[x].penalty,
            additional_payment: reports[x].additional_payment
        }
        const stringifiedReport = JSON.stringify(parsedReport)
        await DBRequest(`INSERT INTO reports (reportid, userid, body) VALUES (${reports[x].rrd_id}, ${users[0].userid}, '${stringifiedReport}')`)
            .catch(async (error) => {
                console.log(error)
                // console.log(x + " " + reports[x].rrd_id)
                const currentReport = await DBRequest(`SELECT * FROM reports WHERE reportid = ${reports[x].rrd_id}`) as any[]
                if (!currentReport[0])
                    return

                if (JSON.stringify(currentReport[0].body) !== JSON.stringify(reports[x])) {
                    await DBRequest(`UPDATE reports SET body = '${JSON.stringify(reports[x])}' WHERE reportid = ${reports[x].rrd_id}`)
                        .catch((error) => {
                            console.log(error)
                        })
                }
            })
    }
});

module.exports = router;