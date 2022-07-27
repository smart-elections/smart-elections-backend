const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');
const {
  checkVotesFetching,
  checkCitizenInVote,
  checkElectionInVote,
} = require('../utils/helpers/utils');

const getVotes = (req, res) => {
  let { sql, params } = checkVotesFetching(req.query);

  db.query(sql, params, (err, rows) => {
    if (err) res.status(statusCodes.queryError).json({ error: err });
    else res.status(statusCodes.success).json({ data: rows });
  });
};

const addVotes = (req, res) => {
  let body = req.body;

  if (!body.election_year || !body.election_type || !body.election_round || !body.citizen_ssn
    || !body.citizen_nationality || !body.candidate_id) {
    res.status(statusCodes.missingParameters).json({ message: 'Missing parameters' });
  }
  else {
    db.query(`SELECT vote_id FROM votes WHERE election_year = ? AND election_type = ? AND election_round = ? 
    AND citizen_ssn = ? AND citizen_nationality = ?;`, [body.election_year, body.election_type, body.election_round,
    body.citizen_ssn, body.citizen_nationality],
      (err, rows) => {
        if (err) res.status(statusCodes.queryError).json({ error: err });
        else {
          if (rows[0]) res.status(statusCodes.fieldAlreadyExists).json({ message: "Citizen already voted" });
          else {
            db.query(`SELECT election_id FROM elections WHERE election_year = ? AND election_round = ? AND election_type = ?;`,
              [body.election_year, body.election_round, body.election_type],
              (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                  if (rows[0]) {
                    db.query(`SELECT citizen_id FROM citizens WHERE citizen_ssn = ? AND citizen_nationality = ?;`,
                      [body.citizen_ssn, body.citizen_nationality],
                      (err, rows) => {
                        if (err) res.status(statusCodes.queryError).json({ error: err });
                        else {
                          if (rows[0]) {
                            db.query(`SELECT election_year, election_round, election_type FROM election_candidate WHERE candidate_id = ?`, body.candidate_id,
                              (err, rows) => {
                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                else {
                                  if (rows[0]) {
                                    if (rows[0].election_year === body.election_year && rows[0].election_round === body.election_round
                                      && rows[0].election_type === body.election_type) {
                                      db.query('INSERT INTO votes SET ?;', body, (err, rows) => {
                                        if (err)
                                          res.status(statusCodes.queryError).json({ error: err });
                                        else
                                          res.status(statusCodes.success).json({ rowID: rows.insertId });
                                      });
                                    }
                                    else res.status(statusCodes.notFound).json({ message: "Candidate isn't in selected election" });
                                  }
                                  else res.status(statusCodes.notFound).json({ message: "Candidate doesn't exist" });
                                }
                              })
                          } else
                            res.status(statusCodes.notFound).json({ message: 'Citizen does not exist' });
                        }
                      }
                    );
                  } else {
                    res.status(statusCodes.notFound).json({ message: 'Election does not exist' });
                  }
                }
              }
            );
          }
        }
      });
  }
};

const editVote = (req, res) => {
  let id = req.query.id;
  let body = req.body;

  if (!id) {
    res.status(statusCodes.missingParameters).json({ message: 'Missing parameters' });
  }
  else {
    db.query('SELECT vote_id FROM votes WHERE vote_id = ?;', id,
      (err, rows) => {
        if (err) res.status(statusCodes.queryError).json({ error: err });
        else {
          if (rows[0]) {
            if (body.citizen_ssn || body.citizen_nationality) {
              let { sql, params } = checkCitizenInVote(body);
              db.query(sql, params, (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });

                else {
                  if (rows[0]) {
                    let { sql, params } = checkElectionInVote(body);

                    db.query(sql, params, (err, rows) => {
                      if (err)
                        res.status(statusCodes.queryError).json({ error: err });
                      else {
                        if (rows[0]) {
                          db.query(`UPDATE votes SET ? WHERE vote_id = ?;`, [body, id],
                            (err, rows) => {
                              if (err) res.status(statusCodes.queryError).json({ error: err });
                              else res.status(statusCodes.success).json({ message: 'Vote updated successfully' });
                            }
                          );
                        }
                        else res.status(statusCodes.notFound).json({ message: 'Election does not exist' });
                      }
                    });
                  } else
                    res.status(statusCodes.notFound).json({ message: 'Citizen does not exist' });
                }
              });
            }
          } else {
            res.status(statusCodes.notFound).json({ message: 'Vote not found' });
          }
        }
      }
    );
  }
};

module.exports = {
  getVotes,
  addVotes,
  editVote,
};
