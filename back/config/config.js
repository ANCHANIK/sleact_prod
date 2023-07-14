require('dotenv').config();

module.exports = {
  "development": {
    "username": "root",
    "password": process.env.MYSQL_PASSWORD,
    "database": "sleact",
    "host": "172.18.0.3",
    "dialect": "mysql"
  },
  "test": {
    "username": "root",
    "password": process.env.MYSQL_PASSWORD,
    "database": "sleact",
    "host": "172.18.0.3",
    "dialect": "mysql"
  },
  "production": {
    "username": "root",
    "password": process.env.MYSQL_PASSWORD,
    "database": "sleact",
    "host": "172.18.0.3",
    "dialect": "mysql"
  }
}
