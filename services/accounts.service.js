const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');


const login = (req, res) => {
    let { ssn } = req.body
    let { password } = req.body

    if (!ssn || !password) {
        res.status(statusCodes.missingParameters).json({ message: "Missing Parameters" });
    }
    else {
        db.query("SELECT * FROM accounts WHERE citizen_ssn = ?", ssn, (err, rows) => {
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


module.exports = {
    login
}