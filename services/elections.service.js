const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');


const getElections = (req, res) => {
    let { year, round, type } = req.query

    console.log(year, round, type)
}

module.exports = {
    getElections
}