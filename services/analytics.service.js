const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');
const { checkRegisteredVotersFetching, checkVotesFetching } = require('../utils/helpers/utils');

const getNbrOfRegisteredVoters = (req, res) => {
    let { year, round, type } = req.query

    if (!year || !type || !round) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        let { sql, params } = checkRegisteredVotersFetching(req.query, true);

        db.query(sql, params,
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                    if (rows[0]) {
                        let currentElection = rows;
                        let previousElection = {
                            type: type,
                            round: round
                        }

                        db.query(`SELECT election_year FROM elections WHERE (election_type = ? AND election_round = ?) ORDER BY election_year ASC;`,
                            [type, round],
                            (err, rows) => {
                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                else {
                                    if (rows[0]) {
                                        let elections = rows

                                        let previousElectionYearIndex = elections.findIndex((election) => {
                                            if (election.election_year === parseInt(year))
                                                return true
                                            else return false
                                        }) - 1

                                        if (previousElectionYearIndex < 0) res.status(statusCodes.notFound).json({ registered_voters: currentElection[0].registered_voters, lastElectionDifference: "No previous elections" });

                                        else {
                                            previousElection.year = elections[previousElectionYearIndex].election_year;

                                            let { sql, params } = checkRegisteredVotersFetching(previousElection, true);

                                            db.query(sql, params,
                                                (err, rows) => {
                                                    if (err) res.status(statusCodes.queryError).json({ error: err });
                                                    else {
                                                        if (rows[0]) {
                                                            let changePercentage = Math.round((currentElection[0].registered_voters * 100 / rows[0].registered_voters - 100) * 100) / 100;

                                                            res.status(statusCodes.success).json({ registered_voters: currentElection[0].registered_voters, lastElectionDifference: changePercentage });
                                                        }
                                                    }
                                                });
                                        }
                                    }
                                    else res.status(statusCodes.notFound).json({ message: "No previous elections found" });
                                }
                            });
                    }
                    else res.status(statusCodes.notFound).json({ message: "No registered voters found" });
                }
            });
    }
}

const getNbrOfVoters = (req, res) => {
    let { year, round, type } = req.query

    if (!year || !type || !round) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        let { sql, params } = checkVotesFetching(req.query, true);

        db.query(sql, params, (err, rows) => {
            if (err) res.status(statusCodes.queryError).json({ error: err });
            else {
                if (rows[0]) {
                    let voters = rows[0].NbrOfVoters;
                    let previousElection = {
                        type: type,
                        round: round
                    }
                    db.query(`SELECT election_year FROM elections WHERE (election_type = ? AND election_round = ?) ORDER BY election_year ASC;`,
                        [type, round],
                        (err, rows) => {
                            if (err) res.status(statusCodes.queryError).json({ error: err });
                            else {
                                if (rows[0]) {
                                    let elections = rows

                                    let previousElectionYearIndex = elections.findIndex((election) => {
                                        if (election.election_year === parseInt(year))
                                            return true
                                        else return false
                                    }) - 1

                                    if (previousElectionYearIndex < 0) res.status(statusCodes.notFound).json({ voters: voters, lastElectionDifference: "No previous elections" });

                                    else {
                                        previousElection.year = elections[previousElectionYearIndex].election_year;

                                        let { sql, params } = checkVotesFetching(previousElection, true);

                                        db.query(sql, params,
                                            (err, rows) => {
                                                if (err) res.status(statusCodes.queryError).json({ error: err });
                                                else {
                                                    if (rows[0]) {
                                                        let changePercentage = Math.round((voters * 100 / rows[0].NbrOfVoters - 100) * 100) / 100;

                                                        res.status(statusCodes.success).json({ voters: voters, lastElectionDifference: changePercentage });
                                                    }
                                                }
                                            });
                                    }
                                }
                                else res.status(statusCodes.notFound).json({ message: "No previous elections found" });
                            }
                        });
                }
            }
        });
    }
}

const getElectionWinner = (req, res) => {
    let { year, round, type } = req.query

    if (!year || !round || !type) {
        res.status(statusCodes.missingParameters).json({ message: "Missing parameters" });
    }
    else {
        db.query(`SELECT election_end FROM elections WHERE (election_year = ? AND election_round = ? AND election_type = ?);`,
            [year, round, type],
            (err, rows) => {
                if (err) res.status(statusCodes.queryError).json({ error: err });
                else {
                    let currentDate = new Date();
                    if (rows[0]) {
                        if (rows[0].election_end.getTime() < currentDate.getTime()) {
                            db.query(`SELECT Count(*) votes, V.candidate_id, candidate_party, candidate_image, citizen_firstname, citizen_lastname FROM votes AS V 
                        INNER JOIN candidates AS CA on V.candidate_id = CA.candidate_id INNER JOIN citizens AS CI on CA.citizen_ssn = CI.citizen_ssn
                        WHERE (election_year = ? AND election_round = ? AND election_type = ?) 
                        GROUP BY V.candidate_id ORDER BY votes DESC;`, [year, round, type],
                                (err, rows) => {
                                    if (err) res.status(statusCodes.queryError).json({ error: err });
                                    else {
                                        if (rows[0]) {
                                            let electionWinner = rows[0]

                                            db.query(`SELECT V.candidate_id, Count(*) as votes,  
                                            ROUND(count(*) * 100.0 / sum(count(*)) over(), 2) as percentage, 
                                            candidate_image, CI.citizen_firstname, CI.citizen_lastname
                                                 FROM votes AS V INNER JOIN candidates AS CA on V.candidate_id = CA.candidate_id 
                                                 INNER JOIN citizens AS CI ON CA.citizen_ssn = CI.citizen_ssn
                                                 WHERE (election_year = ? AND election_type = ? AND election_round = ?)
                                                 GROUP BY candidate_id 
                                                 ORDER BY percentage DESC LIMIT 5;`, [year, round, type],
                                                (err, rows) => {
                                                    if (err) res.status(statusCodes.queryError).json({ error: err });
                                                    else res.status(statusCodes.success).json({ winner: electionWinner, percentage: rows[0].percentage, results: rows })
                                                })
                                        }
                                        else res.status(statusCodes.notFound).json({ message: "No winner declared yet" })
                                    }
                                });
                        }
                        else res.status(statusCodes.notFound).json({ message: "Election hasn't ended yet" });
                    }
                    else res.status(statusCodes.notFound).json({ message: "Election doesn't exist" });
                }
            })
    }
}

module.exports = {
    getNbrOfRegisteredVoters,
    getNbrOfVoters,
    getElectionWinner
}