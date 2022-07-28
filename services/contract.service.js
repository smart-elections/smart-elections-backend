// SETUP WEB3
const Web3 = require('web3');
const getCurrentGasPrices = require('../utils/helpers/eth-utils');
const EthereumTx = require('ethereumjs-tx').Transaction
const ansi = require('ansicolor').nice
const web3 = new Web3(new Web3.providers.HttpProvider(`https://goerli.infura.io/v3/${process.env.TESTNET_KEY})`);
const statusCodes = require('../utils/constants/statusCodes');
const db = require('../database');

const amountToSend = 0.000567

const sendFunds = async (req, res) => {
    db.query(`SELECT election_year, election_type, election_round from elections 
    WHERE election_end <= CURRENT_DATE ORDER BY election_year DESC;`,
        (err, rows) => {
            if (err) res.status(statusCodes.queryError).json({ error: err });
            else {
                if (rows[0]) {
                    db.query(`SELECT wallet_address FROM accounts AS A
                    INNER JOIN registered_voters AS R ON (A.citizen_ssn = R.citizen_ssn 
                        AND A.citizen_nationality = R.citizen_nationality) 
                        WHERE election_year = ? AND election_type = ? AND election_round = ?;`,
                        [rows[0].election_year, rows[0].election_type, rows[0].election_round],
                        (err, rows) => {
                            if (err) res.status(statusCodes.queryError).json({ error: err });
                            else {
                                if (rows[0]) {

                                    let promises = []

                                    rows.map((row, index) => {
                                        promises.push(
                                            new Promise(async (resolve, reject) => {
                                                let nonce = await web3.eth.getTransactionCount(process.env.WALLET_ADDRESS, 'pending');
                                                console.log(`The outgoing transaction count for your wallet address is: ${nonce}`.magenta);

                                                web3.eth.getBalance(process.env.WALLET_ADDRESS, async (err, result) => {
                                                    if (err) {
                                                        res.status(statusCodes.notFound).json({ error: err });
                                                    }
                                                    let balance = web3.utils.fromWei(result, "ether");
                                                    console.log(balance + " ETH");
                                                    if (balance < amountToSend) {
                                                        res.status(statusCodes.notFound).json({ message: 'insufficient funds' });
                                                        return reject();
                                                    }

                                                    let gasPrices = await getCurrentGasPrices();
                                                    let details = {
                                                        "to": row.wallet_address,
                                                        "value": web3.utils.toHex(web3.utils.toWei(amountToSend.toString(), 'ether')),
                                                        "gas": 21000,
                                                        "gasPrice": gasPrices.low * 1000000000,
                                                        "nonce": nonce + index,
                                                        "chainId": 5
                                                    };

                                                    const transaction = new EthereumTx(details, { chain: 'goerli' });
                                                    let privateKey = process.env.WALLET_PRIVATE_KEY.split('0x');
                                                    let privKey = Buffer.from(privateKey[0], 'hex');
                                                    transaction.sign(privKey);

                                                    const serializedTransaction = transaction.serialize();

                                                    web3.eth.sendSignedTransaction('0x' + serializedTransaction.toString('hex'), (err, id) => {
                                                        if (err) {
                                                            res.status(statusCodes.notFound).json({ error: err });
                                                            return reject();
                                                        }
                                                        const url = `https://goerli.etherscan.io/tx/${id}`;

                                                        console.log(url)
                                                        resolve({ id: id, link: url });
                                                    });
                                                });
                                            }).catch((err) => {
                                                console.log(err);
                                            })
                                        )
                                    });
                                    Promise.all(promises).then((result) => {
                                        res.status(statusCodes.success).json({ message: "Funds sent" });
                                    })
                                }
                                else res.status(statusCodes.notFound).json({ message: "There are no registered voters" });
                            }
                        });
                }
                else res.status(statusCodes.notFound).json({ message: "There are no elections" });
            }
        });
}

module.exports = {
    sendFunds
}