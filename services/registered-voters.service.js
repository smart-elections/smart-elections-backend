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

module.exports = {
    getVoters
}