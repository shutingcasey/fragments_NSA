# Create a JSON fragment

POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
test-user1@fragments-testing.com:test-password1

{
  "name": "Casey",
  "course": "CCP"
}

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

[Captures]
url: header "Location"

# GET the JSON fragment we just created
GET {{url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.name" == "Casey"
jsonpath "$.course" == "CCP"