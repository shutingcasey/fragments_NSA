jest.mock('passport', () => ({
  authenticate: jest.fn(),
}));

const passport = require('passport');
const authorize = require('../../src/auth/auth-middleware');

describe('auth-middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls next with an error when passport returns an error', () => {
    passport.authenticate.mockImplementation((strategy, options, callback) => {
      return () => {
        callback(new Error('boom'));
      };
    });

    const middleware = authorize('http');

    const req = {};
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();

    const err = next.mock.calls[0][0];

    expect(err.status).toBe('error');
    expect(err.error.code).toBe(500);
    expect(err.error.message).toBe('Unable to authenticate user');
  });
});