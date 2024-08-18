import http from "node:http"
import https from "node:https"
import fs from "node:fs"
import pg from "node-postgres"

const env = {}

const http_server = http.createServer((req, res) => {
    res.writeHead(200, {"Content-type" : "text/html"})
    res.end("hello world")
    return
}).listen(3000)