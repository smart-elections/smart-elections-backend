const db = require("../database");
const statusCodes = require("../utils/constants/statusCodes");

const getCitizens = (req, res) => {
    let ssn = req.query.ssn

    if (ssn)
        db.query('SELECT * FROM citizens WHERE citizen_ssn = ?;', ssn,
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else res.status(statusCodes.success).json({ data: rows });
            });
    else
        db.query('SELECT * FROM citizens',
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else res.status(statusCodes.success).json({ data: rows });
            });
}

module.exports = {
    getCitizens
}