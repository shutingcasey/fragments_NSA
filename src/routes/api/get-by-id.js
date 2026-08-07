// src/routes/api/get-by-id.js
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

/**
 * GET /v1/fragments/:id
 * Return the raw fragment data with the correct Content-Type.
 */
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    const data = await fragment.getData();

    res.set('Content-Type', fragment.type);

    return res.status(200).send(data);
  } catch (err) {
    logger.error({ err }, 'unable to get fragment data');

    return res
      .status(404)
      .json(createErrorResponse(404, 'fragment not found'));
  }
};