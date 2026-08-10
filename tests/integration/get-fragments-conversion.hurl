# tests/integration/get-fragments-conversion.hurl

# 1. Create a Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`# Hello`

HTTP/1.1 201

[Captures]
mdUrl: header "Location"

# Convert Markdown -> HTML
GET {{mdUrl}}.html
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "text/html"
body == "<h1>Hello</h1>\n"

# Convert Markdown -> plain text
GET {{mdUrl}}.txt
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "text/plain"

# An unsupported conversion (Markdown -> PNG) returns 415
GET {{mdUrl}}.png
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 415


# 2. Create a CSV fragment and convert it to JSON
POST http://localhost:8080/v1/fragments
Content-Type: text/csv
[BasicAuth]
test-user1@fragments-testing.com:test-password1
```
name,age
Alice,30
```

HTTP/1.1 201

[Captures]
csvUrl: header "Location"

GET {{csvUrl}}.json
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "application/json"
jsonpath "$[0].name" == "Alice"
jsonpath "$[0].age" == "30"


# 3. Create a JSON fragment and convert it to YAML
POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
test-user1@fragments-testing.com:test-password1
`{"name": "Alice"}`

HTTP/1.1 201

[Captures]
jsonUrl: header "Location"

GET {{jsonUrl}}.yaml
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" startsWith "application/yaml"
body contains "name: Alice"
