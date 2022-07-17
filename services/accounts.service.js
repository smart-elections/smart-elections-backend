const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');
const { checkAccountsUpdate } = require('../utils/helpers/utils');


const login = (req, res) => {
    let { citizen_ssn, password } = req.body

    if (!citizen_ssn || !password) {
        res.status(statusCodes.missingParameters).json({ message: "Missing Parameters" });
    }
    else {
        db.query("SELECT * FROM accounts WHERE citizen_ssn = ?;", citizen_ssn, (err, rows) => {
            if (err) {
                res.status(statusCodes.queryError).json({ error: err });
            }
            else {
                if (rows[0]) {
                    let citizen = rows[0]

                    if (password === citizen.password) {
                        db.query(`SELECT citizen_gender, citizen_commune FROM citizens LEFT JOIN accounts 
                        on citizens.citizen_ssn = accounts.citizen_ssn WHERE citizens.citizen_ssn = ?;`, citizen_ssn,
                            (err, rows) => {
                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                else {
                                    if (rows[0]) {
                                        res.status(statusCodes.success).json({
                                            message: "Account exists", data: {
                                                username: citizen.username,
                                                wallet_address: citizen.wallet_address,
                                                citizen_ssn: citizen.citizen_ssn,
                                                citizen_nationality: citizen.citizen_nationality,
                                                citizen_gender: rows[0].citizen_gender,
                                                citizen_commune: rows[0].citizen_commune,
                                                isActive: citizen.isActive,
                                            }
                                        });
                                    }
                                    else res.status(statusCodes.notFound).json({ message: "Citizen does not exist, internal error" });
                                }
                            })
                    }
                    else {
                        res.status(statusCodes.wrongPassword).json({ message: "Wrong password" });
                    }
                }
                else {
                    res.status(statusCodes.notFound).json({ message: "Account does not exist" });
                };
            };
        });
    }
}


/**
 * SIGNUP FLOW
 * 
 * account should already exist, but without the password, the username and the metamask address
 * the user tries to register and specifies these fields
 * 
 * the ssn added, along with the full name should be compared with the existing ones to be able to proceed
 * then the user chooses his/her username, password and metmask address
 */

const signup = (req, res) => {
    let { citizen_ssn, citizen_firstname, citizen_lastname, username, password } = req.body

    if (!citizen_ssn || !citizen_firstname || !citizen_lastname || !password || !username) {
        res.status(statusCodes.missingParameters).json({ message: "Missing Parameters" });
    }
    else {
        db.query('SELECT * FROM accounts WHERE citizen_ssn = ?;', citizen_ssn, (err, rows) => {
            if (err)
                res.status(statusCodes.queryError).json({ error: err });
            else {
                if (rows[0]) {
                    if (rows[0].isActive === 1) {
                        res.status(statusCodes.fieldAlreadyExists).json({ message: "Account is already active" });
                    }
                    else {
                        db.query(`SELECT citizen_firstname, citizen_lastname from accounts INNER JOIN 
                    citizens ON accounts.citizen_ssn = citizens.citizen_ssn WHERE accounts.citizen_ssn = ?;`, citizen_ssn, (err, rows) => {
                            if (err)
                                res.status(statusCodes.queryError).json({ error: err })
                            else {
                                if (rows[0]) {
                                    if (citizen_firstname === rows[0].citizen_firstname && citizen_lastname === rows[0].citizen_lastname) {
                                        db.query(`UPDATE accounts SET username = ?, password = ?, isActive = 1 WHERE citizen_ssn = ?;`,
                                            [username, password, citizen_ssn], (err, rows) => {
                                                if (err)
                                                    res.status(statusCodes.queryError).json({ error: err });
                                                else {
                                                    res.status(statusCodes.success).json({ message: "Account added successfully" });
                                                }
                                            })
                                    }
                                    else {
                                        res.status(statusCodes.notFound).json({ message: "Information associated with SSN is incorrect" });
                                    }
                                }
                                else {
                                    res.status(statusCodes.notFound).json({ message: "SSN does not exist in citizens table, internal error" });
                                }

                            }
                        })
                    }
                }
                else {
                    res.status(statusCodes.notFound).json({ message: "SSN is incorrect" });
                }
            }
        })
    }
}

const addWallet = (req, res) => {
    let { wallet_address, citizen_ssn } = req.body

    if (!citizen_ssn || !wallet_address) {
        res.status(statusCodes.missingParameters).json({ message: 'Missing parameters' });
    }
    else {
        db.query('SELECT * from accounts WHERE citizen_ssn = ?;', citizen_ssn, (err, rows) => {
            if (err)
                res.status(statusCodes.queryError).json({ error: err });
            else {
                if (rows[0]) {
                    db.query('SELECT wallet_address FROM accounts WHERE wallet_address = ?;', wallet_address, (err, rows) => {
                        if (err)
                            res.status(statusCodes.queryError).json({ error: err });
                        else {
                            if (rows[0]) {
                                res.status(statusCodes.fieldAlreadyExists).json({ message: "Metamask exists for another account" });
                            }
                            else {
                                db.query('UPDATE accounts SET wallet_address = ? WHERE citizen_ssn = ?;', [wallet_address, citizen_ssn], (err, rows) => {
                                    if (err)
                                        res.status(statusCodes.queryError).json({ error: err });
                                    else
                                        res.status(statusCodes.success).json({ message: "Metamask address added" });
                                })
                            }
                        }
                    })
                }
                else {
                    res.status(statusCodes.notFound).json({ message: "Account does not exist" });
                }
            }
        })
    }
}


const updateAccount = (req, res) => {
    let { username, password, wallet_address } = req.body
    let { ssn, nationality } = req.query

    if (!username && !password && !wallet_address) res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });

    else {
        db.query(`SELECT citizen_id FROM citizens WHERE citizen_ssn = ?;`, ssn,
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                    if (rows[0]) {
                        db.query('SELECT username FROM accounts WHERE username = ? AND citizen_ssn <> ?;',
                            [username, ssn],
                            (err, rows) => {
                                if (err) return res.status(statusCodes.queryError).json({ error: err });
                                else {
                                    if (rows[0]) {
                                        return res.status(statusCodes.fieldAlreadyExists).json({ message: "Username already taken" });
                                    }
                                    else {
                                        db.query('SELECT wallet_address FROM accounts WHERE wallet_address = ? AND citizen_ssn <> ?;', [wallet_address, ssn],
                                            (err, rows) => {
                                                if (err) return res.status(statusCodes.queryError).json({ error: err });

                                                else {
                                                    if (rows[0]) {
                                                        return res.status(statusCodes.fieldAlreadyExists).json({ message: "Metamask exists for another account" });
                                                    }
                                                    else {
                                                        const { sql, params } = checkAccountsUpdate(req.body)

                                                        db.query(sql, [params, ssn, nationality], (err, rows) => {
                                                            if (err) res.status(statusCodes.queryError).json({ error: err });

                                                            else res.status(statusCodes.success).json({ message: "Account updated" });
                                                        });
                                                    }
                                                }
                                            });
                                    }
                                }
                            });
                    }
                    else {
                        res.status(statusCodes.notFound).json({ message: "SSN does not exist" });
                    }
                }
            })
    }
}

module.exports = {
    login,
    signup,
    addWallet,
    updateAccount
}