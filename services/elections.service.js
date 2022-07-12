const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');
const { checkElectionsFetching } = require('../utils/helpers/utils');


const getElections = (req, res) => {

    let { sql, params } = checkElectionsFetching(req.query);

    db.query(sql, params, (err, rows) => {
        if (err) res.status(statusCodes.queryError).json({ error: err });
        else res.status(statusCodes.success).json({ data: rows });
    })
}

const addElection = (req, res) => {
    let body = req.body

    if (!body.election_year || !body.election_type || !body.election_round ||
        !body.election_start || !body.election_end) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        db.query(`SELECT * FROM elections WHERE election_year = ? AND election_type = ? AND
        election_round = ? AND DATE(election_start) = ? AND DATE(election_end) = ?;`, [body.election_year, body.election_type,
        body.election_round, body.election_start, body.election_end],
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                    if (rows[0]) {
                        res.status(statusCodes.fieldAlreadyExists).json({ message: 'Election already exists' });
                    }
                    else {
                        db.query(`INSERT INTO elections SET ?`, body,
                            (err, rows) => {
                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                else res.status(statusCodes.success).json({ rowID: rows.insertId })
                            })
                    }
                }
            })
    }
}

const editElection = (req, res) => {
    let body = req.body
    let { year, type, round } = req.query

    if (!year || !type || !round) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        if (!body.election_start && !body.election_end) res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
        else {
            db.query(`SELECT election_id FROM elections WHERE election_year = ? AND election_type = ? 
            AND election_round = ? AND election_start = ? AND election_end = ?;`, [year, type, round, body.election_start, body.election_end],
                (err, rows) => {
                    if (err) res.status(statusCodes.queryError).json({ error: err });
                    else {
                        if (rows[0]) res.status(statusCodes.fieldAlreadyExists).json({ message: "Election already exists" });
                        else {
                            db.query('UPDATE elections SET ? WHERE election_year = ? AND election_type = ? AND election_round = ?;', [body, year,
                                type, round],
                                (err, rows) => {
                                    if (err) res.status(statusCodes.queryError).json({ error: err });
                                    else res.status(statusCodes.success).json({ message: "Election updated successfully" });
                                })
                        }
                    }
                })
        }
    }
}

module.exports = {
    getElections,
    addElection,
    editElection
}