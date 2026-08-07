const request = require('supertest');

const app = require('../../src/app');
const { Fragment } = require('../../src/model/fragment');
const hash = require('../../src/hash');

describe('GET /v1/fragments/:id.ext', () => {
  test('converts Markdown fragment to HTML', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');

    const fragment = new Fragment({
      ownerId,
      type: 'text/markdown',
    });

    await fragment.setData(Buffer.from('# Hello World'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.html`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^text\/html/);
    expect(res.text).toContain('<h1>Hello World</h1>');
  });

  test('returns 415 for unsupported conversion', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');

    const fragment = new Fragment({
      ownerId,
      type: 'text/plain',
    });

    await fragment.setData(Buffer.from('hello'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.html`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(415);
  });

  test('returns 404 for fragment that does not exist', async () => {
    const res = await request(app)
      .get('/v1/fragments/does-not-exist.html')
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(404);
  });
});