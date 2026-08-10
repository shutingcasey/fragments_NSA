# tests/integration/lab-9-s3.hurl

# 1. Create a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`Hello S3!`

HTTP/1.1 201

[Captures]
url: header "Location"

[Asserts]
header "Location" exists
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 9


# 2. GET the fragment we just created
GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "text/plain"
body == "Hello S3!"


# 3. DELETE the fragment
DELETE {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200


# 4. Try to GET the deleted fragment again
GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404