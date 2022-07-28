const axios = require('axios')

/**
 * Fetch the current transaction gas prices from https://ethgasstation.info/
 * 
 * @return {object} Gas prices at different priorities
 */
const getCurrentGasPrices = async () => {
    let response = await axios.get('https://ethgasstation.info/json/ethgasAPI.json')
    let prices = {
        low: response.data.safeLow / 10,
        medium: response.data.average / 10,
        high: response.data.fast / 10
    }

    console.log("\r\n")
    console.log(`Current ETH Gas Prices (in GWEI):`.cyan)
    console.log("\r\n")
    console.log(`Low: ${prices.low} (transaction completes in < 30 minutes)`.green)
    console.log(`Standard: ${prices.medium} (transaction completes in < 5 minutes)`.yellow)
    console.log(`Fast: ${prices.high} (transaction completes in < 2 minutes)`.red)
    console.log("\r\n")

    return prices
}

module.exports = getCurrentGasPrices