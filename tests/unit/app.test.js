const request = require('supertest');

const app = require('../../src/app');

describe('404 handler', () => {
  test('should return 404 for unknown route', async () => {
    const res = await request(app).get('/this-route-does-not-exist');

    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBe('not found');
  });
});