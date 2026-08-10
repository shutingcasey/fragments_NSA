# tests/integration/post-fragments-image.hurl

# 1. Create a PNG image fragment
POST http://localhost:8080/v1/fragments
Content-Type: image/png
[BasicAuth]
test-user1@fragments-testing.com:test-password1
file,fixtures/test.png;

HTTP/1.1 201

[Captures]
url: header "Location"

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "image/png"


# 2. GET the original image data back
GET {{url}}
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" == "image/png"


# 3. Convert the PNG to JPEG using sharp
GET {{url}}.jpg
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" == "image/jpeg"


# 4. Convert the PNG to WebP using sharp
GET {{url}}.webp
[BasicAuth]
test-user1@fragments-testing.com:test-password1

HTTP/1.1 200

[Asserts]
header "Content-Type" == "image/webp"
