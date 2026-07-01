const contentType = require('content-type');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    if (!Buffer.isBuffer(req.body)) {
      return res.status(415).json(createErrorResponse(415, 'unsupported content type'));
    }

    const { type } = contentType.parse(req);

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

    return res.status(201).json(
      createSuccessResponse({
        fragment,
      })
    );
  } catch {
    return res.status(500).json(createErrorResponse(500, 'unable to create fragment'));
  }
};