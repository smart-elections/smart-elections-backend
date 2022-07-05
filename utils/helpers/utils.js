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

module.exports = {
    accountsUpdateCheck
}