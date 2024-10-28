package main

import (
	"crypto/tls"
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/elazarl/goproxy"
	"github.com/gr3edydevel0per/secureWebGateway/pkg/database"
	"github.com/gr3edydevel0per/secureWebGateway/pkg/filtering"
)

func startProxy(db *sql.DB) {
	// Create a new proxy server
	proxy := goproxy.NewProxyHttpServer()
	proxy.Verbose = false

	// Enable SSL/TLS MITM interception
	proxy.OnRequest().HandleConnect(goproxy.AlwaysMitm)

	// Load the CA certificate for SSL interception
	caCert, err := tls.LoadX509KeyPair("certs/rootCA.pem", "certs/rootCA.key")
	if err != nil {
		log.Fatalf("Failed to load CA certificate and key: %v", err)
		os.Exit(1)
	}
	goproxy.GoproxyCa = caCert

	log.Println("Starting proxy server on :8081 with SSL/TLS interception")

	// Domain and IP filtering integration using concurrency
	proxy.OnRequest().DoFunc(filtering.CheckDomainAndIP(db))

	// File download scanning for malware using ClamAV
	proxy.OnResponse().DoFunc(filtering.CheckAndScanAllContent())

	// Uncomment this block if you want to add an HTTPS enforcement policy
	// proxy.OnRequest().DoFunc(policy.EnforceHTTPS())

	// Uncomment the lines below if you want to log request/response details for debugging or auditing

	// Request logging: Logs incoming requests to the proxy
	// proxy.OnRequest().DoFunc(func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	// 	log.Printf("Request URL: %s", req.URL.String())
	// 	return req, nil
	// })

	// Response logging: Logs outgoing responses from the proxy
	// proxy.OnResponse().DoFunc(func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
	// 	log.Printf("Response Status: %d", resp.StatusCode)
	// 	return resp
	// })

	// Start the proxy server on port 8081
	if err := http.ListenAndServe(":8081", proxy); err != nil {
		log.Fatalf("Failed to start proxy server: %v", err)
	}
}

func main() {
	// Connect to the database
	db, err := database.ConnectDb()
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
		os.Exit(1)
	}
	defer db.Close()

	// Start the proxy server
	startProxy(db)
}
