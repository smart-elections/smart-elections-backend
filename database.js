const mysql = require("mysql");

const config = {
    connectionLimit: 10,
    host: `${process.env.DATABASE_HOST_KEY}`,
    user: `${process.env.DATABASE_USER_KEY}`,
    password: `${process.env.DATABASE_PASS_KEY}`,
    database: `${process.env.DATABASE_NAME_KEY}`,
    port: 3306,
    timezone: 'UTC'
};

let mysqlConnection

function startConnection() {
    mysqlConnection = mysql.createPool(config);
    mysqlConnection.getConnection((err, connection) => {
        if (!err) {
            console.log("Database Status: " + connection.state);
        }
        else {
            console.log(
                "Database connection failed \n Error: " + JSON.stringify(err, undefined, 2)
            );
            startConnection();
        }
    });
    mysqlConnection.on('error', err => {
        if (err.fatal)
            startConnection();
    });
}

startConnection();

module.exports = mysqlConnection;