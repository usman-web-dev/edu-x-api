module.exports = ({ env }) => ({
  connection: {
    client: "mysql",
    connection: {
      host: env("MYSQLHOST", "127.0.0.1"),
      port: env.int("MYSQLPORT", 3306),
      database: env("MYSQLDATABASE", "edu-x"),
      user: env("MYSQLUSER", "root"),
      password: env("MYSQLPASSWORD", ""),
      ssl: env.bool("MYSQLSSL", false),
    },
  },
});
