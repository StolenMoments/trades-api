var express = require('express');
var router = express.Router();

require('dotenv').config();
const pool = require('../database/mariadb');
const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: process.env.APIKEY,
    APISECRET: process.env.APISECRET,
});

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', { title: 'Express' });
});

router.get('/trades', function (req, res) {
    /* sample userTrades
    [
      {
        "buyer": false,
        "commission": "-0.07819010",
        "commissionAsset": "USDT",
        "id": 698759,
        "maker": false,
        "orderId": 25851813,
        "price": "7819.01",
        "qty": "0.002",
        "quoteQty": "15.63802",
        "realizedPnl": "-0.91539999",
        "side": "SELL",
        "positionSide": "SHORT",
        "symbol": "BTCUSDT",
        "time": 1569514978020
      }
    ]*/

    binance.futuresUserTrades('BTCUSDT').then(async (userTrades) => {
        let trades = [];
        for (let trade of userTrades) {
            trades.push(`(${ trade.id },${ getDateString(trade.time) },  '${ trade.symbol }',
            '${ trade.positionSide }','${ trade.price }','${ trade.realizedPnl }')`);
        }

        let conn;
        try {
            conn = await pool.getConnection();
            if (trades.length > 0) {
                await conn.query('INSERT IGNORE INTO trade_history values ' + trades.join(','));
            }
            const result = await conn.query('SELECT * FROM TRADE_HISTORY');
            res.send(result);
        } catch (err) {
            console.log(err);
            res.send(err);
        } finally {
            if (conn) await conn.end();
        }
    });
});

function getDateString(timestamp) {
    const date = new Date(timestamp);
    let year = date.getFullYear().toString();

    let month = date.getMonth() + 1;
    month = month < 10 ? '0' + month.toString() : month.toString();

    let day = date.getDate();
    day = day < 10 ? '0' + day.toString() : day.toString();

    let hour = date.getHours();
    hour = hour < 10 ? '0' + hour.toString() : hour.toString();

    let minutes = date.getMinutes();
    minutes = minutes < 10 ? '0' + minutes.toString() : minutes.toString();

    let seconds = date.getSeconds();
    seconds = seconds < 10 ? '0' + seconds.toString() : seconds.toString();

    return String().concat(year, month, day, hour, minutes, seconds);
}

module.exports = router;
