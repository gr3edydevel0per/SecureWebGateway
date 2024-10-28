package filtering

import (
	"log"
	"net/http"
	"regexp"
	"strings"

	"github.com/elazarl/goproxy"
)

// DLP rules
var sensitivePatterns = []string{
	`\b(?:\d[ -]*?){13,16}\b`,
	`\b\d{3}-\d{2}-\d{4}\b`,
}
var sensitiveKeywords = []string{
	"confidential", "restricted", "secret",
}
var blockedFileTypes = []string{
	".docx", ".pdf", ".xls",
}
var blockedDestinations = []string{
	`.*@gmail\.com`, `.*@yahoo\.com`,
}

// ScanRequests applies DLP rules to HTTP requests
func ScanRequests(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	// Scan URL
	for _, pattern := range sensitivePatterns {
		regexp.MustCompile(pattern)
		if matched, _ := regexp.MatchString(pattern, req.URL.String()); matched {
			log.Printf("Sensitive pattern detected in URL: %s", req.URL.String())
			return req, goproxy.NewResponse(req, "text/plain", http.StatusForbidden, "Sensitive data transmission blocked")
		}
	}

	// Scan Headers or Body for sensitive keywords
	for _, keyword := range sensitiveKeywords {
		if strings.Contains(req.URL.String(), keyword) {
			log.Printf("Sensitive keyword detected in URL: %s", req.URL.String())
			return req, goproxy.NewResponse(req, "text/plain", http.StatusForbidden, "Sensitive data transmission blocked")
		}
	}

	// Check for blocked file types
	for _, fileType := range blockedFileTypes {
		if strings.HasSuffix(req.URL.Path, fileType) {
			log.Printf("Blocked file type detected in URL: %s", req.URL.String())
			return req, goproxy.NewResponse(req, "text/plain", http.StatusForbidden, "File type not allowed")
		}
	}

	// Check for blocked destination domains
	for _, domain := range blockedDestinations {
		if matched, _ := regexp.MatchString(domain, req.URL.Host); matched {
			log.Printf("Blocked destination detected: %s", req.URL.Host)
			return req, goproxy.NewResponse(req, "text/plain", http.StatusForbidden, "Transmission to this domain is not allowed")
		}
	}

	return req, nil
}

func ScanResponses(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
	// Implement response scanning if necessary
	return resp
}
