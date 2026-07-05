// src/routes/api/get-info.js

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/:id/info
 * Return metadata for a single fragment.
 */
module.exports = async (req, res) => {
  try {
    // Find the fragment that belongs to the authenticated user
    const fragment = await Fragment.byId(req.user, req.params.id);

    // Return the fragment metadata
    return res.status(200).json(
      createSuccessResponse({
        fragment,
      })
    );
  } catch (err) {
    logger.error({ err }, 'unable to get fragment metadata');

    return res
      .status(404)
      .json(createErrorResponse(404, 'fragment not found'));
  }
};