const mysql = require('mariadb');
require('dotenv').config();

const config ={
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
};

const pool = mysql.createPool(config);

module.exports = pool;