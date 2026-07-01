// tests/unit/memory.test.js

const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
} = require('../../src/model/data/memory');

describe('memory data model', () => {
  test('writeFragment() and readFragment() store and return fragment metadata', async () => {
    const fragment = {
      id: 'fragment-1',
      ownerId: 'user-1',
      created: '2026-07-01T00:00:00.000Z',
      updated: '2026-07-01T00:00:00.000Z',
      type: 'text/plain',
      size: 11,
    };

    await writeFragment(fragment);

    const result = await readFragment(fragment.ownerId, fragment.id);

    expect(result).toEqual(fragment);
  });

  test('readFragment() returns undefined for missing fragment', async () => {
    const result = await readFragment('user-1', 'missing-id');

    expect(result).toBe(undefined);
  });

  test('writeFragmentData() and readFragmentData() store and return fragment data buffer', async () => {
    const ownerId = 'user-1';
    const id = 'fragment-1';
    const buffer = Buffer.from('hello world');

    await writeFragmentData(ownerId, id, buffer);

    const result = await readFragmentData(ownerId, id);

    expect(result).toEqual(buffer);
  });

  test('readFragmentData() returns undefined for missing data', async () => {
    const result = await readFragmentData('user-1', 'missing-id');

    expect(result).toBe(undefined);
  });
});