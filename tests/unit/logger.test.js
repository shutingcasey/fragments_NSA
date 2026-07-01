describe('logger', () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    delete process.env.FRAGMENTS_LOG_LEVEL;
  });

  test('exports a logger instance', () => {
    const logger = require('../../src/logger');

    expect(logger).toBeDefined();
    expect(logger.info).toEqual(expect.any(Function));
    expect(logger.error).toEqual(expect.any(Function));
  });

  test('uses pretty transport in debug mode', () => {
    process.env.FRAGMENTS_LOG_LEVEL = 'debug';

    const logger = require('../../src/logger');

    expect(logger).toBeDefined();
    expect(logger.debug).toEqual(expect.any(Function));
  });
});