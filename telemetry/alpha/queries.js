//const Pool = require("pg").Pool;
import pg from 'pg';
const pool = new pg.Pool({
     user: "postgres",
     host: "localhost",
     database: "postgres",
     password: "password",
     port: 5432,
});

const getMessages = (request, response) => {
   pool.query(
      "SELECT * FROM messages ORDER BY id DESC LIMIT 10",
      (error, results) => {
         if (error) {
            throw error;
         }
         response.status(200).json(results.rows);
      }
   );
};

const getSocketMessages = () => {
   return new Promise((resolve) => {
      pool.query(
         "SELECT * FROM messages ORDER BY id DESC LIMIT 10",
         (error, results) => {
            if (error) {
               throw error;
            }
            resolve(results.rows);
          }
      );
   });
};
//exports.getSocketMessages = getSocketMessages;
/*
module.exports = {
   getMessages,
   getSocketMessages,
};
*/
