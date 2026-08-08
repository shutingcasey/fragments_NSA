# Posting an unsupported fragment type should fail

POST http://localhost:8080/v1/fragments
Content-Type: application/xml

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`<note>This should not be accepted</note>`

HTTP/1.1 415