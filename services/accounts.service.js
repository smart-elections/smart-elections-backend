const db = require('../database');
const statusCodes = require('../utils/constants/statusCodes');


const login = (req, res) => {
    let { ssn } = req.body
    let { password } = req.body
}

module.exports = {
    login
}