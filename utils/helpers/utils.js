const accountsUpdateCheck = (req) => {
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

const electionsFetchingCheck = (req) => {
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

const votesFetchingCheck = (req) => {
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

module.exports = {
    accountsUpdateCheck,
    electionsFetchingCheck,
    votesFetchingCheck
}