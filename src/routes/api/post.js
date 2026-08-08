// src/routes/api/post.js
const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      logger.warn({ contentType: req.headers['content-type'] }, 'unsupported content type');

      return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
    }

    const type = contentType.format(contentType.parse(req));

    logger.debug({ type, size: req.body.length }, 'creating fragment');

    const fragment = new Fragment({
      ownerId: req.user,
      type,
    });

    await fragment.setData(req.body);

    const apiUrl = process.env.API_URL || `http://${req.headers.host}`;

    const location = new URL(
    `/v1/fragments/${fragment.id}`,
    apiUrl
    );

    res.setHeader('Location', location.href);

    logger.info(
      { fragmentId: fragment.id, ownerId: fragment.ownerId, type: fragment.type, size: fragment.size },
      'fragment created'
    );

    return res.status(201).json(
      createSuccessResponse({
        fragment,
      })
    );
  } catch (err) {
    logger.error({ err }, 'unable to create fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to create fragment'));
  }
};