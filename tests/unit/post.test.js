const request = require('supertest');
const app = require('../../src/app');

describe('POST /v1/fragments', () => {
  test('unauthenticated requests are denied', () =>
    request(app).post('/v1/fragments').send('hello').expect(401));

  test('authenticated users can create a plain text fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');

    expect(res.body.fragment).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        ownerId: expect.any(String),
        created: expect.any(String),
        updated: expect.any(String),
        type: 'text/plain',
        size: 5,
      })
    );
  });

  test('POST response includes Location header', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    expect(res.statusCode).toBe(201);
    expect(res.headers.location).toMatch(
      /^http:\/\/127\.0\.0\.1:\d+\/v1\/fragments\/[0-9a-fA-F-]+$/
    );
  });

  test('unsupported content type returns 415', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/msword')
      .send('hello');

    expect(res.statusCode).toBe(415);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(415);
  });
});