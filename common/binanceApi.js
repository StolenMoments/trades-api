const Binance = require('node-binance-api');
const binanceApi = new Binance().options({
  APIKEY: process.env.APIKEY,
  APISECRET: process.env.APISECRET,
});

module.exports = binanceApi;
