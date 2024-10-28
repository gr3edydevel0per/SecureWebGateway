package filtering

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"regexp"
	"sync"

	"github.com/elazarl/goproxy"
	"github.com/gr3edydevel0per/secureWebGateway/pkg/utility"
)

/*
This function takes a domain name after removing the TLD and checks the database
to see whether the domain is blocked. If it is blocked, it retrieves the corresponding regex pattern.
*/
func CheckBlockedDomain(db *sql.DB, domain string) string {
	var regex string
	err := db.QueryRow("SELECT blocking_pattern FROM blocked_domain WHERE domain = ?", domain).Scan(&regex)
	if err != nil {
		if err == sql.ErrNoRows {
			return ""
		}
		log.Printf("Error querying blocked_domain table: %v", err)
		return ""
	}
	return regex
}

/*
CheckBlockedIP checks if an IP is blocked by querying the blocked_ip table in the database.
Returns true if the IP is blocked.
*/
func CheckBlockedIP(db *sql.DB, ip string) bool {
	var exists bool
	err := db.QueryRow("SELECT EXISTS(SELECT 1 FROM blocked_ip WHERE ip = ?)", ip).Scan(&exists)
	if err != nil {
		log.Printf("Error querying blocked_ip table: %v", err)
		return false
	}
	return exists
}

/*
HandleDomainBlocking checks if a domain is blocked. If blocked, it returns a redirect response to the block page.
*/
func HandleDomainBlocking(db *sql.DB, req *http.Request, responseChan chan<- *http.Response, wg *sync.WaitGroup) {
	defer wg.Done()
	cleanedDomain := utility.CleanDomain(req.URL.Host)
	blockPattern := CheckBlockedDomain(db, cleanedDomain)

	if blockPattern != "" {
		re := regexp.MustCompile(blockPattern)
		if re.MatchString(req.URL.Host) {
			log.Printf("Redirecting URL by domain: %s to block page", req.URL.Host)
			redirectURL := fmt.Sprintf("http://localhost:4000/blocked?url=%s", req.URL.String())
			redirectResponse := goproxy.NewResponse(req, "", http.StatusTemporaryRedirect, "")
			redirectResponse.Header.Set("Location", redirectURL)
			responseChan <- redirectResponse
			return
		}
	}
	responseChan <- nil
}

func HandleIPBlocking(db *sql.DB, req *http.Request, responseChan chan<- *http.Response, wg *sync.WaitGroup) {
	defer wg.Done()
	domain := utility.CleanDomain(req.URL.Host)
	ip, err := utility.ResolveDomainToIP(domain)
	if err != nil {
		log.Printf("Could not resolve domain to IP: %s, error: %v", req.URL.Host, err)
		responseChan <- nil
		return
	}
	if CheckBlockedIP(db, ip) {
		log.Printf("Redirecting URL by IP: %s (Domain: %s) to block page", ip, req.URL.Host)
		redirectURL := fmt.Sprintf("http://localhost:4000/blocked?url=%s", req.URL.String())
		redirectResponse := goproxy.NewResponse(req, "", http.StatusTemporaryRedirect, "")
		redirectResponse.Header.Set("Location", redirectURL)
		responseChan <- redirectResponse
		return
	}

	responseChan <- nil
}

/*
CheckDomainAndIP creates a function that checks if a domain or its resolved IP is blocked.
If blocked, it redirects the request to the block page hosted on a local Node.js server.
*/
func CheckDomainAndIPRule(db *sql.DB) func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	return func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		var wg sync.WaitGroup
		responseChan := make(chan *http.Response, 2) // Buffer for two responses

		wg.Add(1)
		go HandleDomainBlocking(db, req, responseChan, &wg)
		wg.Add(1)
		go HandleIPBlocking(db, req, responseChan, &wg)
		go func() {
			wg.Wait()
			close(responseChan)
		}()

		for response := range responseChan {
			if response != nil {
				log.Println("Redirecting to block page.")
				return req, response
			}
		}

		return req, nil
	}
}
