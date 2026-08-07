// tests/unit/get-by-id.test.js
const request = require('supertest');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('GET /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', async () => {
    const res = await request(app).get('/v1/fragments/123');

    expect(res.statusCode).toBe(401);
  });

  test('authenticated user can get fragment data', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');

    const fragment = new Fragment({
      ownerId,
      type: 'text/plain',
    });

    await fragment.setData(Buffer.from('hello world'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/plain/);
    expect(res.text).toBe('hello world');
  });

  test('returns 404 for a fragment that does not exist', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
  });
});