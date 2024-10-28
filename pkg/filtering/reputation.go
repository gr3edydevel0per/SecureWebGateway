package filtering

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/elazarl/goproxy"
	"github.com/gr3edydevel0per/secureWebGateway/pkg/utility"
	"github.com/joho/godotenv"
)

type IPQSResponse struct {
	Success      bool   `json:"success"`
	FraudScore   int    `json:"fraud_score"`
	Message      string `json:"message"`
	RiskType     string `json:"risk_type"`
	Country      string `json:"country"`
	RequestError string `json:"request_error,omitempty"`
}

// CheckDomainReputation queries the IPQS API for domain reputation
func CheckDomainReputation(domain string) (*IPQSResponse, error) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	apiKey := os.Getenv("IPQS_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("IPQS API key missing")
	}

	url := fmt.Sprintf("https://ipqualityscore.com/api/json/domain/%s/%s", apiKey, domain)
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("Error reaching IPQS API: %v", err)
	}
	defer resp.Body.Close()

	var ipqsResp IPQSResponse
	if err := json.NewDecoder(resp.Body).Decode(&ipqsResp); err != nil {
		return nil, fmt.Errorf("Error decoding IPQS response: %v", err)
	}

	if !ipqsResp.Success {
		return nil, fmt.Errorf("IPQS API error: %v", ipqsResp.RequestError)
	}

	return &ipqsResp, nil
}

// CheckIPReputation queries the IPQS API for IP reputation
func CheckIPReputation(ip string) (*IPQSResponse, error) {
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	apiKey := os.Getenv("IPQS_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("IPQS API key missing")
	}

	url := fmt.Sprintf("https://ipqualityscore.com/api/json/ip/%s/%s", apiKey, ip)
	resp, err := http.Get(url)
	if err != nil {
		return nil, fmt.Errorf("Error reaching IPQS API: %v", err)
	}
	defer resp.Body.Close()

	var ipqsResp IPQSResponse
	if err := json.NewDecoder(resp.Body).Decode(&ipqsResp); err != nil {
		return nil, fmt.Errorf("Error decoding IPQS response: %v", err)
	}

	if !ipqsResp.Success {
		return nil, fmt.Errorf("IPQS API error: %v", ipqsResp.RequestError)
	}

	return &ipqsResp, nil
}

// CheckDomainAndIP handles the proxy request and checks domain and IP reputation asynchronously
func CheckDomainAndIPReputation(db *sql.DB) func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	return func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		domain := req.URL.Hostname() // Extract domain from the request
		cleanDomain := utility.CleanDomain(domain)
		ip, err := utility.ResolveDomainToIP(cleanDomain) // Extract IP from the domain
		if err != nil {
			log.Printf("Error resolving domain to IP: %v", err)
			return req, goproxy.NewResponse(req, goproxy.ContentTypeText, http.StatusBadGateway, "Error resolving domain to IP")
		}

		// Channel to handle blocking response in case of fraud
		blockCh := make(chan *http.Response, 2) // Buffer size 2 for both domain and IP checks

		// Check domain reputation asynchronously
		go func() {
			domainRep, err := CheckDomainReputation(cleanDomain)
			if err != nil {
				log.Printf("Error checking domain reputation: %v", err)
				blockCh <- nil
				return
			}

			if domainRep.FraudScore > 80 {
				log.Printf("Blocking domain %s due to high fraud score", cleanDomain)
				blockCh <- goproxy.NewResponse(req, goproxy.ContentTypeText, http.StatusForbidden, "Access Denied: Malicious Domain")
			} else {
				blockCh <- nil
			}
		}()

		// Check IP reputation asynchronously
		go func() {
			ipRep, err := CheckIPReputation(ip)
			if err != nil {
				log.Printf("Error checking IP reputation: %v", err)
				blockCh <- nil
				return
			}

			if ipRep.FraudScore > 80 {
				log.Printf("Blocking IP %s due to high fraud score", ip)
				blockCh <- goproxy.NewResponse(req, goproxy.ContentTypeText, http.StatusForbidden, "Access Denied: Malicious IP")
			} else {
				blockCh <- nil
			}
		}()

		// Wait for a blocking response or continue processing if none
		for i := 0; i < 2; i++ {
			if resp := <-blockCh; resp != nil {
				return nil, resp
			}
		}

		return req, nil
	}
}
