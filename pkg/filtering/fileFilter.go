package filtering

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/dutchcoders/go-clamd"
	"github.com/elazarl/goproxy"
)

// ScanFileWithClamAV scans the content using ClamAV.
func ScanFileWithClamAV(content []byte) (bool, error) {
	// Connect to ClamAV daemon using the local socket
	clamdClient := clamd.NewClamd("unix:///var/run/clamav/clamd.ctl")

	// Scan the content
	scanResult, err := clamdClient.ScanStream(bytes.NewReader(content), nil)
	if err != nil {
		return false, fmt.Errorf("error initiating scan with ClamAV: %v", err)
	}

	// Iterate over scan results
	for result := range scanResult {
		if result.Status == clamd.RES_FOUND {
			log.Printf("Malware found: %s", result.Description)
			return false, fmt.Errorf("content is malicious: %s", result.Description)
		}
	}

	log.Println("Content is clean.")
	return true, nil
}

// HandleDownloadAndScan scans every downloaded content for malware.
func HandleDownloadAndScan(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
	log.Println("Scanning response content...")

	// Read the entire content of the response
	content, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Error reading content: %v", err)
		return resp
	}
	defer resp.Body.Close()

	// Scan the content for malware
	isClean, err := ScanFileWithClamAV(content)
	if err != nil {
		log.Printf("Malware detected in content: %v", err)
		blockedResponse := goproxy.NewResponse(ctx.Req, "", http.StatusForbidden, "Content blocked due to malware detection.")
		return blockedResponse
	}

	// If clean, recreate the response body with the original content
	if isClean {
		resp.Body = ioutil.NopCloser(bytes.NewReader(content))
	}

	// Proceed with the response
	return resp
}

// CheckAndScanAllContent scans every type of downloaded content for malware before allowing it.
func CheckAndScanAllContent() func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
	return func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
		return HandleDownloadAndScan(resp, ctx)
	}
}
