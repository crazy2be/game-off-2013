package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	//So shiny...
	_ "net/http/pprof"
)

func handler(w http.ResponseWriter, r *http.Request) {
	// Workaround for Quentin's system configuration.
	// For some reason, css files are getting served
	// without a content-type...
	if strings.HasSuffix(r.URL.Path, ".css") {
		w.Header().Set("Content-Type", "text/css")
	}
	http.ServeFile(w, r, "."+r.URL.Path)
}

func main() {
	// 	setupPrompt()

	portNumber := flag.Int("port", 8080, "Sets the port the server listens on for both http requests and websocket connections.")

	flag.Parse()

	http.HandleFunc("/", handler)

	fmt.Println("Beginning HTTP listening on port", *portNumber)
	err := http.ListenAndServe(":"+strconv.Itoa(*portNumber), nil)
	if err != nil {
		log.Fatal("ListenAndServe:", err)
	}
}
