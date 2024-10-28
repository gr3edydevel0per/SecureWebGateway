package utility

import (
	"fmt"
	"log"
	"net"
	"strings"
)

/*
CleanDomain takes a domain name as input and returns a cleaned version.
Domain retrieved from request is in the form of www.meta.com:443.
It removes the port number and prefix like www. to retrieve only the domain and subdomain.
*/
func CleanDomain(domain string) string {
	domain = strings.Split(domain, ":")[0] // Remove port if any
	if strings.HasPrefix(domain, "www.") {
		domain = domain[4:] // Remove "www."
	}

	parts := strings.Split(domain, ".")
	if len(parts) > 2 {

		domain = parts[len(parts)-2] + "." + parts[len(parts)-1]
	}

	return domain
}

/*
ResolveDomainToIP resolves a domain name to its IP address and returns the first IP.
*/
func ResolveDomainToIP(domain string) (string, error) {
	ips, err := net.LookupIP(domain)
	if err != nil {
		return "", err
	}

	for _, ip := range ips {
		if ipv4 := ip.To4(); ipv4 != nil {
			log.Println("Resolved IPv4:", ipv4.String()) // Logging for debugging
			return ipv4.String(), nil
		}
	}

	return "", fmt.Errorf("no IPv4 address found for domain: %s", domain)
}
