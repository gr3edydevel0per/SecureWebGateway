package database

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

/* ConnectDb connects to the MariaDB database */
// This function connects to the MariaDB database and returns the connection object.

func ConnectDb() (*sql.DB, error) {
	connectionString := "networkx:networkx@tcp(localhost:3306)/NetworkX"
	db, err := sql.Open("mysql", connectionString)
	log.Println(db)
	if err != nil {
		panic(err.Error())
	}
	return db, err
}
