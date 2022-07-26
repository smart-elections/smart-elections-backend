const db = require('../database');
const statusCodes = require("../utils/constants/statusCodes");
const { checkRegisteredVotersFetching } = require('../utils/helpers/utils');

const getVoters = (req, res) => {

    let { sql, params } = checkRegisteredVotersFetching(req.query);

    db.query(sql, params,
        (err, rows) => {
            if (err) res.status(statusCodes.queryError).json({ error: err });
            else res.status(statusCodes.success).json({ data: rows });
        })

}

const addVoter = (req, res) => {
    let body = {
        year: req.body.election_year,
        round: req.body.election_round,
        type: req.body.election_type,
        ssn: req.body.citizen_ssn,
        nationality: req.body.citizen_nationality
    }

    if (!body.year || !body.round || !body.type || !body.ssn || !body.nationality) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        let { sql, params } = checkRegisteredVotersFetching(body);

        db.query(sql, params,
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                    if (rows[0]) {
                        res.status(statusCodes.fieldAlreadyExists).json({ message: "Voter already registered for this election" });
                    }
                    else {
                        db.query(`SELECT citizen_id FROM citizens WHERE (citizen_ssn = ? AND citizen_nationality = ?);`, [body.ssn, body.nationality],
                            (err, rows) => {
                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                else {
                                    if (rows[0]) {
                                        db.query(`SELECT election_id FROM elections WHERE (election_year = ? AND election_type = ? AND election_round = ?);`,
                                            [body.year, body.type, body.round],
                                            (err, rows) => {
                                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                                else {
                                                    if (rows[0]) {
                                                        db.query(`INSERT INTO registered_voters SET ?;`, req.body,
                                                            (err, rows) => {
                                                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                                                else {
                                                                    res.status(statusCodes.success).json({ message: "Registered for elections successfully", rowID: rows.insertId });
                                                                    console.log(rows)
                                                                }
                                                            })
                                                    }
                                                    else res.status(statusCodes.notFound).json({ message: "Election doesn't exist" });
                                                }
                                            })
                                    }
                                    else res.status(statusCodes.notFound).json({ message: "Citizen doesn't exist" });
                                }
                            })
                    }
                }
            })
    }
}

module.exports = {
    getVoters,
    addVoter
}