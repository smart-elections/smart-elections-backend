const e = require('express');
const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');
const { votesFetchingCheck } = require('../utils/helpers/utils');

const getVotes = (req, res) => {

    let { sql, params } = votesFetchingCheck(req.query);

    db.query(sql, params, (err, rows) => {
        if (err) res.status(statusCodes.queryError).json({ error: err });
        else res.status(statusCodes.success).json({ data: rows });
    });
}

const addVotes = (req, res) => {
    let body = req.body

    if (!body.election_year || !body.election_type || !body.election_round ||
        !body.citizen_ssn || !body.citizen_nationality) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        db.query(`SELECT election_id FROM elections WHERE election_year = ? AND election_round = ? 
        AND election_type = ?`, [body.election_year, body.election_round, body.election_type],
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                    if (rows[0]) {
                        db.query(`SELECT citizen_id FROM citizens WHERE citizen_ssn = ? AND citizen_nationality = ?`,
                            [body.citizen_ssn, body.citizen_nationality],
                            (err, rows) => {
                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                else {
                                    if (rows[0]) {
                                        db.query('INSERT INTO votes SET ?;', body,
                                            (err, rows) => {
                                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                                else res.status(statusCodes.success).json({ rowID: rows.insertId })
                                            })
                                    }
                                    else res.status(statusCodes.notFound).json({ message: "Citizen does not exist" });
                                }
                            })
                    }
                    else {
                        res.status(statusCodes.notFound).json({ message: "Election does not exist" })
                    }
                }
            })
    }
}

module.exports = {
    getVotes,
    addVotes
}