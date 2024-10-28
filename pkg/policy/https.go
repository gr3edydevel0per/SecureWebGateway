package policy

import (
	"log"
	"net/http"
	"strings"

	"github.com/elazarl/goproxy"
)

func EnforceHTTPS() func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	return func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		if !strings.HasPrefix(req.URL.Scheme, "https") {
			log.Println("DEBUG CONSOLE >> ", req.URL.Scheme)

			httpsURL := "https://" + req.URL.Host + req.URL.Path
			if req.URL.RawQuery != "" {
				httpsURL += "?" + req.URL.RawQuery
			}

			response := goproxy.NewResponse(req, "text/plain", http.StatusMovedPermanently, "Redirecting to HTTPS")
			response.Header.Set("Location", httpsURL)
			return req, response
		}

		return req, nil
	}
}
