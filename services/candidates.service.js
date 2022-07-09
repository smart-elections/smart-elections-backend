const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');


const getCandidates = (req, res) => {
    let id = req.query.id

    if (id) {
        db.query('SELECT * FROM candidates wHERE candidate_id = ?;', id,
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else res.status(statusCodes.success).json({ data: rows });
            })
    }
    else {
        db.query('SELECT * FROM candidates;',
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else res.status(statusCodes.success).json({ data: rows });
            })
    }
}

const addCandidate = (req, res) => {
    let body = req.body

    body.candidate_election_status = 0

    if (!body.election_year || !body.election_round || !body.election_type ||
        !body.candidate_party || !body.citizen_ssn || !body.citizen_nationality) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        db.query(`SELECT * FROM (SELECT citizen_ssn, citizen_nationality FROM election_candidate LEFT JOIN candidates on 
        election_candidate.candidate_id = candidates.candidate_id 
        WHERE election_year = ? AND election_round = ? AND 
        election_type = ?) as election_candidates WHERE citizen_ssn = ? AND citizen_nationality = ?;`,
            [body.election_year, body.election_round, body.election_type, body.citizen_ssn, body.citizen_nationality],
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                    if (rows[0]) {
                        res.status(statusCodes.fieldAlreadyExists).json({ message: "Candidate already registered for this election" })
                    }
                    else {
                        db.query(`INSERT INTO candidates (citizen_ssn, citizen_nationality, candidate_party, 
                            candidate_election_status) values (?,?,?,?);`, [body.citizen_ssn, body.citizen_nationality, body.candidate_party,
                        body.candidate_election_status],
                            (err, rows) => {
                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                else {
                                    let id = rows.insertId

                                    db.query(`INSERT INTO election_candidate (candidate_id, election_year, election_round, election_type)
                                    values (?,?,?,?);`, [id, body.election_year, body.election_round, body.election_type],
                                        (err, rows) => {
                                            if (err) res.status(statusCodes.queryError).json({ error: err });
                                            else res.status(statusCodes.success).json({ message: "Candidate added successfully", data: rows })
                                        })
                                }
                            })
                    }
                }
            })

    }
}

const updateCandidate = (req, res) => {
    let body = req.body
    let id = req.query.id

    db.query(`UPDATE candidates SET ? WHERE candidate_id = ?;`, [body, id],
        (err, rows) => {
            if (err) res.status(statusCodes.queryError).json({ error: err });
            else res.status(statusCodes.success).json({ message: "Candidate updated successfully" });
        });
}

module.exports = {
    getCandidates,
    addCandidate,
    updateCandidate
}