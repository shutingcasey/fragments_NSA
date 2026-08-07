// src/model/fragment.js

// Use crypto.randomUUID() to create unique IDs, see:
// https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
const { randomUUID } = require('crypto');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');

const logger = require('../logger');

// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

class Fragment {
  constructor({ id, ownerId, created, updated, type, size = 0 }) {
    if (!ownerId || !type) {
        throw new Error('ownerId and type are required');
    }

    if (!Fragment.isSupportedType(type)) {
        throw new Error(`unsupported fragment type: ${type}`);
    }

    if (typeof size !== 'number' || size < 0) {
        throw new Error('size must be a non-negative number');
    }

    const now = new Date().toISOString();

    this.id = id || randomUUID();
    this.ownerId = ownerId;
    this.created = created || now;
    this.updated = updated || now;
    this.type = type;
    this.size = size;
 }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  
  static async byUser(ownerId, expand = false) {
    logger.debug({ ownerId, expand }, 'getting fragments by user');
    const fragments = await listFragments(ownerId, expand);

    if (expand) {
        return fragments.map((fragment) =>
        new Fragment(typeof fragment === 'string' ? JSON.parse(fragment) : fragment)
        );
    }

    return fragments;
}

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */

  static async byId(ownerId, id) {
    logger.debug({ ownerId, id }, 'getting fragment by id');
    const fragment = await readFragment(ownerId, id);

    if (!fragment) {
        logger.warn({ ownerId, id }, 'fragment not found');
        throw new Error(`fragment not found: ${id}`);
    }

    return new Fragment(fragment);
}

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<void>
   */
  static delete(ownerId, id) {
    logger.info({ ownerId, id }, 'deleting fragment');
    return deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment (metadata) to the database
   * @returns Promise<void>
   */
  
  save() {
    this.updated = new Date().toISOString();
    logger.debug(
      {
        ownerId: this.ownerId,
        id: this.id,
        type: this.type,
        size: this.size,
      },
      'saving fragment metadata'
    );
    return writeFragment(this);
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  getData() {
    logger.debug({ ownerId: this.ownerId, id: this.id }, 'getting fragment data');
    return readFragmentData(this.ownerId, this.id);
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise<void>
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      logger.warn({ id: this.id }, 'setData called without Buffer');
      throw new Error('data must be a Buffer');
    }

    this.size = data.length;
    this.updated = new Date().toISOString();

    logger.debug(
      {
        ownerId: this.ownerId,
        id: this.id,
        size: this.size,
      },
      'setting fragment data'
    );

    await writeFragmentData(this.ownerId, this.id, data);
    await writeFragment(this);
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    return this.mimeType.startsWith('text/');
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.mimeType === 'text/markdown') {
      return ['text/markdown', 'text/html'];
    }

    return [this.mimeType];
  }

  static isSupportedType(value) {
    try {
      const { type } = contentType.parse(value);

      return type.startsWith('text/') || type === 'application/json';
    } catch {
      return false;
    }
  }
}

module.exports.Fragment = Fragment;