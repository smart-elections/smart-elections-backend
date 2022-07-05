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

const addCitizen = (req, res) => {

    let body = req.body

    if (!body.citizen_ssn || !body.citizen_nationality || !body.citizen_firstname || !body.citizen_lastname)
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    else
        db.query('SELECT * FROM citizens WHERE citizen_ssn = ? and citizen_nationality = ?;', [body.citizen_ssn,
        body.citizen_nationality], (err, rows) => {
            if (err)
                res.status(statusCodes.queryError).json({ error: err });
            else
                if (rows[0])
                    res.status(statusCodes.fieldAlreadyExists).json({ message: "Citizen already exists" });
                else
                    db.query('INSERT INTO citizens SET ?;', [body], (err, rows) => {
                        if (err)
                            res.status(statusCodes.queryError).json({ error: err });
                        else
                            res.status(statusCodes.success).json({ message: "Citizen added successfully" });
                    });
        });

}

module.exports = {
    getCitizens,
    addCitizen
}