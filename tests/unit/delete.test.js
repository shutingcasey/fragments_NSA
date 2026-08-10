// tests/unit/delete.test.js
const request = require('supertest');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('DELETE /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).delete('/v1/fragments/123').expect(401));

  test('returns 404 for a fragment that does not exist', async () => {
    const res = await request(app)
      .delete('/v1/fragments/does-not-exist')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('authenticated users can delete an existing fragment', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello'));

    const res = await request(app)
      .delete(`/v1/fragments/${fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });

    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(getRes.statusCode).toBe(404);
  });
});
