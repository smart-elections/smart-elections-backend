const checkAccountsUpdate = (req) => {
    let sql = "UPDATE accounts SET ? WHERE citizen_ssn = ? and citizen_nationality = ?;"
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

const checkElectionsFetching = (req) => {
    let sql = `SELECT election_id, election_year, election_type, election_round, election_start,
    election_end FROM elections `
    let params = []


    if (req.year || req.round || req.type) {
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
    }

    sql += ';'

    return { sql, params }
}

const checkVotesFetching = (req) => {
    let sql = `SELECT * FROM votes `
    let params = []


    if (req.year || req.round || req.type || req.ssn || req.nationality) {
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
    let sql = `SELECT election_id FROM elections WHERE TRUE`
    let params = []

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

    sql += ';'

    return { sql, params }
}

module.exports = {
    checkAccountsUpdate,
    checkElectionsFetching,
    checkVotesFetching,
    checkCitizenInVote,
    checkElectionInVote
}