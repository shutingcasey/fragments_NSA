# tests/integration/delete-fragments.hurl

# 1. Unauthenticated DELETE is rejected
DELETE http://localhost:8080/v1/fragments/does-not-matter

HTTP/1.1 401


# 2. Deleting a fragment that doesn't exist returns 404
DELETE http://localhost:8080/v1/fragments/does-not-exist
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404


# 3. Create a fragment, then delete it
POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`Delete me`

HTTP/1.1 201

[Captures]
url: header "Location"


# 4. Delete the fragment we just created
DELETE {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"


# 5. Confirm the fragment is gone
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404
