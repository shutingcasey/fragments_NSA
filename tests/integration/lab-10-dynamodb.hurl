# tests/integration/lab-10-dynamodb.hurl

# 1. POST a new JSON fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json

[BasicAuth]
test-user1@fragments-testing.com:test-password1

{
  "service": "DynamoDB"
}

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "application/json"

[Captures]
fragment1_url: header "Location"
fragment1_id: jsonpath "$.fragment.id"
fragment1_ownerId: jsonpath "$.fragment.ownerId"
fragment1_created: jsonpath "$.fragment.created"
fragment1_type: jsonpath "$.fragment.type"
fragment1_size: jsonpath "$.fragment.size"


# 2. GET the metadata for the fragment we just created, and confirm it matches
GET {{fragment1_url}}/info

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment1_id}}
jsonpath "$.fragment.ownerId" == {{fragment1_ownerId}}
jsonpath "$.fragment.type" == {{fragment1_type}}
jsonpath "$.fragment.size" == {{fragment1_size}}
jsonpath "$.fragment.created" == {{fragment1_created}}


# 3. POST a second, Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/markdown

[BasicAuth]
test-user1@fragments-testing.com:test-password1

`DynamoDB is **great**.`

HTTP/1.1 201

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/markdown"

[Captures]
fragment2_url: header "Location"
fragment2_id: jsonpath "$.fragment.id"
fragment2_ownerId: jsonpath "$.fragment.ownerId"
fragment2_created: jsonpath "$.fragment.created"
fragment2_type: jsonpath "$.fragment.type"
fragment2_size: jsonpath "$.fragment.size"


# 4. GET the metadata for the second fragment, and confirm it matches
GET {{fragment2_url}}/info

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" == {{fragment2_id}}
jsonpath "$.fragment.ownerId" == {{fragment2_ownerId}}
jsonpath "$.fragment.type" == {{fragment2_type}}
jsonpath "$.fragment.size" == {{fragment2_size}}
jsonpath "$.fragment.created" == {{fragment2_created}}


# 5. GET all fragments (ids only) for this user; both new ids should be included
GET http://localhost:8080/v1/fragments

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}


# 6. DELETE the first fragment
DELETE {{fragment1_url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200


# 7. Try to GET the first fragment again; it should be gone
GET {{fragment1_url}}

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 404


# 8. GET all fragments (ids only) again; fragment1 gone, fragment2 still there
GET http://localhost:8080/v1/fragments

[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragments" not contains {{fragment1_id}}
jsonpath "$.fragments" contains {{fragment2_id}}
