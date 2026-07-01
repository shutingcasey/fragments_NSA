// src/routes/api/get.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  try {
    const expand = req.query.expand === '1';
    const fragments = await Fragment.byUser(req.user, expand);

    return res.status(200).json(
      createSuccessResponse({
        fragments,
      })
    );
  } catch (err) {
    logger.error({ err }, 'unable to get fragments');
    return res.status(500).json(createErrorResponse(500, 'unable to get fragments'));
  }
};