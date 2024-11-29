const mariadb = require('mariadb');

const dbUser = "networkx";
const dbPass = "networkx";


async function executeQuery(sql, params = []) {
   try {
      const connection = await mariadb.createConnection({
         host: "127.0.0.1",
         user: dbUser,
         password: dbPass,
         database: 'NetworkX',
         port: 3306 
      });
      
      const result = await connection.query(sql, params); 
      await connection.end();
      return result;
   } catch (error) {
      console.error('Error connecting to MariaDB:', error);
      throw error; }
}

module.exports = {
   executeQuery
};
