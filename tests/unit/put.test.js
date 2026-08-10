// tests/unit/put.test.js
const request = require('supertest');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('PUT /v1/fragments/:id', () => {
  test('unauthenticated requests are denied', () =>
    request(app).put('/v1/fragments/123').send('hello').expect(401));

  test('returns 404 for a fragment that does not exist', async () => {
    const res = await request(app)
      .put('/v1/fragments/does-not-exist')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
  });

  test('returns 400 if the Content-Type does not match the fragment type', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello'));

    const res = await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/markdown')
      .send('# hello');

    expect(res.statusCode).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('authenticated users can update an existing fragment', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello'));

    const res = await request(app)
      .put(`/v1/fragments/${fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('updated data');

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment.id).toBe(fragment.id);
    expect(res.body.fragment.size).toBe(Buffer.byteLength('updated data'));

    const getRes = await request(app)
      .get(`/v1/fragments/${fragment.id}`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(getRes.text).toBe('updated data');
  });
});
