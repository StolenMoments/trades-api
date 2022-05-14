const pool = require('./database/mariadb');
const Binance = require('node-binance-api');
const getDateString = require('./common/functions');
const binance = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
});

binance.futuresUserTrades().then(async (userTrades) => {
  let trades = [];
  for (let trade of userTrades) {
    trades.push(`(${trade.id},${getDateString(trade.time)},  '${trade.symbol}',
            '${trade.side}','${trade.price}','${trade.realizedPnl}')`);
  }

  let conn;
  try {
    conn = await pool.getConnection();
    if (trades.length > 0) {
      console.log(
        await conn.query(
          'INSERT IGNORE INTO trade_history values ' + trades.join(',')),
      );
    }
  } catch (err) {
    console.log(err);
  } finally {
    if (conn) await conn.end();
    process.exit();
  }
}).catch(err => console.log(err));
