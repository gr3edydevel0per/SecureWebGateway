package logging

import (
	"log"
	"net/http"

	"github.com/elazarl/goproxy"
)

func RequestLogger() func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
	return func(req *http.Request, ctx *goproxy.ProxyCtx) (*http.Request, *http.Response) {
		log.Printf("Request: %s %s", req.Method, req.URL.String())
		return req, nil
	}

}

func ResponseLogger() func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
	return func(resp *http.Response, ctx *goproxy.ProxyCtx) *http.Response {
		log.Printf("Response: %s %d", resp.Request.URL.String(), resp.StatusCode)
		return resp
	}
}
