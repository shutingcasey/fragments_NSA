# Unauthenticated POST to /v1/fragments should fail

POST http://localhost:8080/v1/fragments
Content-Type: text/plain

`This is an unauthenticated fragment!`

HTTP/1.1 401