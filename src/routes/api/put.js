// src/routes/api/put.js
const contentType = require('content-type');

const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * PUT /v1/fragments/:id
 * Replace the data for an authenticated user's existing fragment.
 */
module.exports = async (req, res) => {
  let fragment;
  try {
    fragment = await Fragment.byId(req.user, req.params.id);
  } catch (err) {
    logger.warn({ err, id: req.params.id }, 'fragment not found');
    return res.status(404).json(createErrorResponse(404, 'fragment not found'));
  }

  let type;
  try {
    ({ type } = contentType.parse(req));
  } catch {
    return res.status(400).json(createErrorResponse(400, 'a valid Content-Type header is required'));
  }

  if (type !== fragment.mimeType) {
    return res
      .status(400)
      .json(createErrorResponse(400, "Content-Type does not match the fragment's existing type"));
  }

  try {
    await fragment.setData(req.body);

    logger.info(
      { fragmentId: fragment.id, ownerId: fragment.ownerId, size: fragment.size },
      'fragment updated'
    );

    return res.status(200).json(createSuccessResponse({ fragment }));
  } catch (err) {
    logger.error({ err }, 'unable to update fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to update fragment'));
  }
};
