describe('auth/index.js', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
  });

  test('throws if both Cognito and Basic Auth are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'us-east-1_abc123';
    process.env.AWS_COGNITO_CLIENT_ID = '1234567890abcdefghijklmnop';
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';

    expect(() => require('../../src/auth')).toThrow(
      /both AWS Cognito and HTTP Basic Auth/
    );
  });

  test('uses Cognito auth when Cognito env vars are configured', () => {
    process.env.AWS_COGNITO_POOL_ID = 'us-east-1_abc123';
    process.env.AWS_COGNITO_CLIENT_ID = '1234567890abcdefghijklmnop';
    delete process.env.HTPASSWD_FILE;

    const auth = require('../../src/auth');

    expect(auth).toBeDefined();
    expect(auth.authenticate).toEqual(expect.any(Function));
  });

  test('uses Basic Auth when HTPASSWD_FILE is configured outside production', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    process.env.HTPASSWD_FILE = 'tests/.htpasswd';
    process.env.NODE_ENV = 'test';

    const auth = require('../../src/auth');

    expect(auth).toBeDefined();
    expect(auth.authenticate).toEqual(expect.any(Function));
  });

  test('throws if no auth configuration is provided', () => {
    delete process.env.AWS_COGNITO_POOL_ID;
    delete process.env.AWS_COGNITO_CLIENT_ID;
    delete process.env.HTPASSWD_FILE;

    expect(() => require('../../src/auth')).toThrow(
      /missing env vars/
    );
  });
});