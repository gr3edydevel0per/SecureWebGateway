#!/bin/bash

sudo service mariadb start

# Run Go program
echo "Starting NGFW..."
go run cmd/proxy/main.go &

# Run Node.js web server
echo "Starting Node.js web server..."
node webServer/app.js &

# Wait for both processes to finish
wait
