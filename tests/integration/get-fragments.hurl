# tests/integration/get-fragments.hurl

# 1. Unauthenticated GET is rejected
GET http://localhost:8080/v1/fragments

HTTP/1.1 401


# 2. Create a fragment so the list isn't empty
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user2@fragments-testing:test-password2
`Fragment for listing`

HTTP/1.1 201

[Captures]
id: jsonpath "$.fragment.id"


# 3. GET the list of fragment ids for this user
GET http://localhost:8080/v1/fragments
[BasicAuth]
test-user2@fragments-testing:test-password2

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments" contains {{id}}


# 4. GET the expanded list of fragments for this user
GET http://localhost:8080/v1/fragments?expand=1
[BasicAuth]
test-user2@fragments-testing:test-password2

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragments[?(@.id=='{{id}}')].type" == "text/plain"


# 5. GET the fragment's metadata via /info
GET http://localhost:8080/v1/fragments/{{id}}/info
[BasicAuth]
test-user2@fragments-testing:test-password2

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{id}}
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 20
