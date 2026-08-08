# Test posting a text/plain fragment with a charset

# 1. POST a fragment with charset
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`This is a fragment!`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain; charset=utf-8"
jsonpath "$.fragment.size" == 19

# Save the Location so we can GET the fragment
[Captures]
url: header "Location"

# 2. GET the fragment we just created
GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: text/plain; charset=utf-8

[Asserts]
body == "This is a fragment!"