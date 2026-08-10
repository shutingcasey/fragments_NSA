// tests/unit/post.test.js
const request = require('supertest');
const sharp = require('sharp');
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

  test('authenticated users can create a JSON fragment', async () => {
    const data = JSON.stringify({
      name: 'Casey',
      assignment: 2,
    });

    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/json')
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');

    expect(res.body.fragment).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        ownerId: expect.any(String),
        created: expect.any(String),
        updated: expect.any(String),
        type: 'application/json',
        size: Buffer.byteLength(data),
      })
    );
  });

  test('authenticated users can create a Markdown fragment', async () => {
    const data = '# Hello World';

    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/markdown')
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');

    expect(res.body.fragment).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        ownerId: expect.any(String),
        created: expect.any(String),
        updated: expect.any(String),
        type: 'text/markdown',
        size: Buffer.byteLength(data),
      })
    );

  });

  test('authenticated users can create a CSV fragment', async () => {
    const data = 'name,age\nAlice,30';

    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'text/csv')
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body.fragment.type).toBe('text/csv');
    expect(res.body.fragment.size).toBe(Buffer.byteLength(data));
  });

  test('authenticated users can create a YAML fragment', async () => {
    const data = 'name: Alice';

    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'application/yaml')
      .send(data);

    expect(res.statusCode).toBe(201);
    expect(res.body.fragment.type).toBe('application/yaml');
    expect(res.body.fragment.size).toBe(Buffer.byteLength(data));
  });

  test('authenticated users can create a PNG image fragment', async () => {
    const png = await sharp({
      create: { width: 2, height: 2, channels: 3, background: { r: 0, g: 255, b: 0 } },
    })
      .png()
      .toBuffer();

    const res = await request(app)
      .post('/v1/fragments')
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .set('Content-Type', 'image/png')
      .send(png);

    expect(res.statusCode).toBe(201);
    expect(res.body.fragment.type).toBe('image/png');
    expect(res.body.fragment.size).toBe(png.length);
  });
});