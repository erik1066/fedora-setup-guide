//go:debug x509negativeserial=1
package main

import (
	"database/sql"
	"flag"
	"fmt"
	"log"

	_ "github.com/microsoft/go-mssqldb"
	_ "github.com/microsoft/go-mssqldb/integratedauth/krb5"
)

var (
	debug         = flag.Bool("debug", false, "enable debugging")
	password      = flag.String("password", "my-secret-pw-12345", "the database password")
	port     *int = flag.Int("port", 1433, "the database port")
	server        = flag.String("server", "localhost", "the database server")
	user          = flag.String("user", "sa", "the database user")
)

func main() {
	fmt.Printf("Starting program to print all MSSQL schemas:\n\n")

	flag.Parse()

	if *debug {
		fmt.Printf(" password:%s\n", *password)
		fmt.Printf(" port:%d\n", *port)
		fmt.Printf(" server:%s\n", *server)
		fmt.Printf(" user:%s\n", *user)
	}

	connString := fmt.Sprintf("server=%s;user id=%s;password=%s;port=%d", *server, *user, *password, *port)

	if *debug {
		fmt.Printf(" connString:%s\n", connString)
	}

	conn, err := sql.Open("mssql", connString)

	if err != nil {
		log.Fatal("Open connection failed:", err.Error())
	}

	defer conn.Close()

	stmt, err := conn.Prepare("SELECT name FROM sys.schemas")
	if err != nil {
		log.Fatal("Prepare failed:", err.Error())
	}
	defer stmt.Close()

	rows, err := stmt.Query()
	if err != nil {
		log.Fatal("Query failed:", err.Error())
	}
	defer rows.Close()

	for rows.Next() {
		var schemaName string

		err = rows.Scan(&schemaName)
		if err != nil {
			log.Fatal("Row scan failed:", err.Error())
		}

		fmt.Println(schemaName)
	}

	fmt.Printf("\nEnding program\n")
}
