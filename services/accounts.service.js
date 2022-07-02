const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');


const login = (req, res) => {
    let { ssn } = req.body
    let { password } = req.body

    if (!ssn || !password) {
        res.status(statusCodes.missingParameters).json({ message: "Missing Parameters" });
    }
    else {
        db.query("SELECT * FROM accounts WHERE citizen_ssn = ?;", ssn, (err, rows) => {
            if (err) {
                res.status(statusCodes.queryError).json({ error: err });
            }
            else {
                if (rows[0]) {
                    if (password === rows[0].password) {
                        res.status(statusCodes.success).json({
                            message: "Account exists", data: {
                                username: rows[0].username,
                                wallet_address: rows[0].wallet_address,
                                citizen_ssn: rows[0].citizen_ssn,
                                citizen_nationality: rows[0].citizen_nationality,
                                isActive: rows[0].isActive
                            }
                        });
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
    let { ssn } = req.body
    let { firstName } = req.body
    let { lastName } = req.body
    let { username } = req.body
    let { password } = req.body

    if (!ssn || !firstName || !lastName || !password || !username) {
        res.status(statusCodes.missingParameters).json({ message: "Missing Parameters" });
    }
    else {
        db.query('SELECT * FROM accounts WHERE citizen_ssn = ?;', ssn, (err, rows) => {
            if (err)
                res.status(statusCodes.queryError).json({ error: err });
            else {
                if (rows[0]) {
                    if (rows[0].isActive === 1) {
                        res.status(statusCodes.fieldAlreadyExists).json({ message: "Account is already active" });
                    }
                    else {
                        db.query(`SELECT citizen_firstname, citizen_lastname from accounts INNER JOIN 
                    citizens ON accounts.citizen_ssn = citizens.citizen_ssn WHERE accounts.citizen_ssn = ?;`, ssn, (err, rows) => {
                            if (err)
                                res.status(statusCodes.queryError).json({ error: err })
                            else {
                                if (rows[0]) {
                                    if (firstName === rows[0].citizen_firstname && lastName === rows[0].citizen_lastname) {
                                        db.query(`UPDATE accounts SET username = ?, password = ?, isActive = 1 WHERE citizen_ssn = ?;`,
                                            [username, password, ssn], (err, rows) => {
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
    let { wallet_address } = req.body
    let { ssn } = req.body

    if (!ssn || !wallet_address) {
        res.status(statusCodes.missingParameters).json({ message: 'Missing parameters' });
    }
    else {
        db.query('SELECT * from accounts WHERE citizen_ssn = ?;', ssn, (err, rows) => {
            if (err)
                res.status(statusCodes.queryError).json({ error: err });
            else {
                if (rows[0]) {
                    db.query('UPDATE accounts SET wallet_address = ? WHERE citizen_ssn = ?;', [wallet_address, ssn], (err, rows) => {
                        if (err)
                            res.status(statusCodes.queryError).json({ error: err });
                        else
                            res.status(statusCodes.success).json({ message: "metamask address added" });
                    })
                }
                else {
                    res.status(statusCodes.notFound).json({ message: "Account does not exist" });
                }
            }
        })
    }
}

module.exports = {
    login,
    signup,
    addWallet
}