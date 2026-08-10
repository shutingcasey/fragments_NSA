const request = require('supertest');
const sharp = require('sharp');

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

  test('returns 415 for an unknown extension', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.exe`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(415);
  });

  test('converts CSV fragment to JSON', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'text/csv' });
    await fragment.setData(Buffer.from('name,age\nAlice,30\nBob,25'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.json`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^application\/json/);
    expect(res.body).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ]);
  });

  test('converts JSON fragment to YAML', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'application/json' });
    await fragment.setData(Buffer.from(JSON.stringify({ name: 'Alice' })));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.yaml`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^application\/yaml/);
    expect(res.text).toContain('name: Alice');
  });

  test('converts PNG fragment to JPEG using sharp', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'image/png' });
    const png = await sharp({
      create: { width: 1, height: 1, channels: 3, background: { r: 255, g: 0, b: 0 } },
    })
      .png()
      .toBuffer();
    await fragment.setData(png);

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.jpg`)
      .auth('test-user1@fragments-testing.com', 'test-password1')
      .buffer(true)
      .parse((response, callback) => {
        response.setEncoding('binary');
        let data = '';
        response.on('data', (chunk) => (data += chunk));
        response.on('end', () => callback(null, Buffer.from(data, 'binary')));
      });

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^image\/jpeg/);

    const metadata = await sharp(res.body).metadata();
    expect(metadata.format).toBe('jpeg');
  });

  test('returns 415 when a text fragment is converted to an image type', async () => {
    const ownerId = hash('test-user1@fragments-testing.com');
    const fragment = new Fragment({ ownerId, type: 'text/plain' });
    await fragment.setData(Buffer.from('hello'));

    const res = await request(app)
      .get(`/v1/fragments/${fragment.id}.png`)
      .auth('test-user1@fragments-testing.com', 'test-password1');

    expect(res.statusCode).toBe(415);
  });
});