# tests/integration/put-fragments.hurl

# 1. Create a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Original data`

HTTP/1.1 201

[Captures]
url: header "Location"


# 2. Update the fragment's data with a matching Content-Type
PUT {{url}}
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Updated data`

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 12


# 3. GET the fragment and confirm the data was replaced
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
body == "Updated data"


# 4. Trying to update with a mismatched Content-Type fails with 400
PUT {{url}}
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`# Not allowed`

HTTP/1.1 400

[Asserts]
jsonpath "$.status" == "error"


# 5. Trying to update a fragment that doesn't exist returns 404
PUT http://localhost:8080/v1/fragments/does-not-exist
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`data`

HTTP/1.1 404
