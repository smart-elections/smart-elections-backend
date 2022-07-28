
const checkAccountsUpdate = (req) => {
    let sql = "UPDATE accounts SET ? WHERE citizen_ssn = ? AND citizen_nationality = ?;"
    let params = {}

    if (req.username) {
        params.username = req.username;
    }

    if (req.password) {
        params.password = req.password;
    }

    if (req.wallet) {
        params.wallet_address = req.wallet;
    }

    return { sql, params }
}

const checkElectionsFetching = (req, candidates) => {

    let sql = ``
    let params = []

    if (candidates) {
        sql += `SELECT E.election_id, E.election_year, E.election_type, E.election_round, E.election_start,
        E.election_end, CA.candidate_id, CA.candidate_image, CA.candidate_party, CA.candidate_election_status, CA.citizen_ssn,
        CA.citizen_nationality, CA.candidate_twitter, citizen_firstname, citizen_lastname, 
        citizen_gender, citizen_yob FROM elections AS E INNER JOIN election_candidate AS EC
            ON E.election_year = EC.election_year AND E.election_type = EC.election_type AND E.election_round = EC.election_round
            INNER JOIN candidates AS CA on CA.candidate_id = EC.candidate_id INNER JOIN citizens AS CI on CA.citizen_ssn = CI.citizen_ssn `
    }
    else {
        sql += `SELECT election_id, election_year, election_type, election_round, election_start,
        election_end FROM elections AS E `
    }

    if (req.year || req.round || req.type || req.end) {
        sql += 'WHERE TRUE'

        if (req.year !== undefined) {
            sql += ` AND E.election_year = ?`
            params.push(req.year);
        }
        if (req.round !== undefined) {
            sql += ` AND E.election_round = ?`
            params.push(req.round);
        }
        if (req.type !== undefined) {
            sql += ` AND E.election_type = ?`
            params.push(req.type);
        }
        if (req.end !== undefined) {
            sql += ` AND election_end <= CURRENT_DATE`
        }
    }

    sql += ' ORDER BY election_end DESC;'
    return { sql, params }
}

const checkVotesFetching = (req, analytics) => {
    let sql = ``
    let params = []

    if (analytics) {
        sql += `SELECT Count(*) AS NbrOfVoters FROM votes `
    }
    else {
        sql += `SELECT * FROM votes `
    }

    if (req.year || req.round || req.type || req.ssn || req.nationality || req.candidate_id) {
        sql += 'WHERE TRUE'

        if (req.year !== undefined) {
            sql += ` AND election_year = ?`
            params.push(req.year);
        }
        if (req.round !== undefined) {
            sql += ` AND election_round = ?`
            params.push(req.round);
        }
        if (req.type !== undefined) {
            sql += ` AND election_type = ?`
            params.push(req.type);
        }
        if (req.ssn !== undefined) {
            sql += ` AND citizen_ssn = ?`
            params.push(req.ssn);
        }
        if (req.nationality !== undefined) {
            sql += ` AND citizen_nationality = ?`
            params.push(req.nationality);
        }
        if (req.candidate_id !== undefined) {
            sql += ` AND candidate_id = ?`
            params.push(req.candidate_id);
        }
    }

    sql += ';'

    return { sql, params }
}

const checkCitizenInVote = (req) => {
    let sql = `SELECT citizen_ssn FROM citizens WHERE TRUE`
    let params = []

    if (req.citizen_ssn !== undefined) {
        sql += ` AND citizen_ssn = ?`
        params.push(req.citizen_ssn);
    }
    if (req.citizen_nationality !== undefined) {
        sql += ` AND citizen_nationality = ?`
        params.push(req.citizen_nationality);
    }

    sql += ';'

    return { sql, params }
}

const checkElectionInVote = (req) => {
    let sql = `SELECT election_id FROM elections`
    let params = []

    if (req.election_year || req.election_round || req.election_type) {
        sql += 'WHERE TRUE'

        if (req.election_year !== undefined) {
            sql += ` AND election_year = ?`
            params.push(req.election_year);
        }
        if (req.election_type !== undefined) {
            sql += ` AND election_type = ?`
            params.push(req.election_type);
        }
        if (req.election_round !== undefined) {
            sql += ` AND election_round = ?`
            params.push(req.election_round);
        }
    }

    sql += ';'

    return { sql, params }
}

const checkRegisteredVotersFetching = (req, analytics) => {
    let sql = ``

    if (analytics) {
        sql += `SELECT Count(*) AS registered_voters, election_year, election_round, election_type FROM registered_voters `
    }
    else {
        sql += `SELECT * FROM registered_voters `
    }

    let params = []

    if (req.year || req.round || req.type || req.ssn || req.nationality) {
        sql += 'WHERE TRUE'

        if (req.year !== undefined) {
            sql += ` AND election_year = ?`
            params.push(req.year);
        }
        if (req.type !== undefined) {
            sql += ` AND election_type = ?`
            params.push(req.type);
        }
        if (req.round !== undefined) {
            sql += ` AND election_round = ?`
            params.push(req.round);
        }
        if (req.ssn !== undefined) {
            sql += ` AND citizen_ssn = ?`
            params.push(req.ssn);
        }
        if (req.nationality !== undefined) {
            sql += ` AND citizen_nationality = ?`
            params.push(req.nationality);
        }
    }

    sql += ' GROUP BY election_year, election_round, election_type;'
    return { sql, params }
}

module.exports = {
    checkAccountsUpdate,
    checkElectionsFetching,
    checkVotesFetching,
    checkCitizenInVote,
    checkElectionInVote,
    checkRegisteredVotersFetching
}