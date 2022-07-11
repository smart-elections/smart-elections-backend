const e = require('express');
const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');
const { votesFetchingCheck } = require('../utils/helpers/utils');

const getVotes = (req, res) => {

    let { sql, params } = votesFetchingCheck(req.query);

    db.query(sql, params, (err, rows) => {
        if (err) res.status(statusCodes.queryError).json({ error: err });
        else res.status(statusCodes.success).json({ data: rows });
    });
}


module.exports = {
    getVotes
}