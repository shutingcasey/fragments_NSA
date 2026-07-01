const mockVerifier = {
  hydrate: jest.fn(() => Promise.resolve()),
  verify: jest.fn(),
};

jest.mock('aws-jwt-verify', () => ({
  CognitoJwtVerifier: {
    create: jest.fn(() => mockVerifier),
  },
}));

describe('auth/cognito', () => {
  beforeEach(() => {
    jest.resetModules();
    mockVerifier.hydrate.mockResolvedValue();
    mockVerifier.verify.mockReset();

    process.env.AWS_COGNITO_POOL_ID = 'us-east-1_abc123';
    process.env.AWS_COGNITO_CLIENT_ID = '1234567890abcdefghijklmnop';
  });

  test('strategy verifies token and returns email', async () => {
    mockVerifier.verify.mockResolvedValue({ email: 'test@example.com' });

    const cognito = require('../../src/auth/cognito');
    const strategy = cognito.strategy();
    const done = jest.fn();

    await strategy._verify('token', done);

    expect(done).toHaveBeenCalledWith(null, 'test@example.com');
  });

  test('strategy returns false when token verification fails', async () => {
    mockVerifier.verify.mockRejectedValue(new Error('bad token'));

    const cognito = require('../../src/auth/cognito');
    const strategy = cognito.strategy();
    const done = jest.fn();

    await strategy._verify('token', done);

    expect(done).toHaveBeenCalledWith(null, false);
  });

  test('exports authenticate function', () => {
    const cognito = require('../../src/auth/cognito');

    expect(cognito.authenticate).toEqual(expect.any(Function));
  });
});