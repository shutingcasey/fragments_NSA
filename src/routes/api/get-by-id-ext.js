// src/routes/api/get-by-id-ext.js
const MarkdownIt = require('markdown-it');

const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

const md = new MarkdownIt();

/**
 * GET /v1/fragments/:id.ext
 * Convert a fragment to a supported format.
 */
module.exports = async (req, res) => {
  try {
    const { id, ext } = req.params;

    const fragment = await Fragment.byId(req.user, id);
    const data = await fragment.getData();

    // Assignment 2 only requires Markdown -> HTML conversion
    if (fragment.mimeType === 'text/markdown' && ext === 'html') {
      const html = md.render(data.toString());

      res.set('Content-Type', 'text/html');
      return res.status(200).send(html);
    }

    return res
      .status(415)
      .json(createErrorResponse(415, 'unsupported conversion'));
  } catch (err) {
    logger.error({ err }, 'unable to convert fragment');

    return res
      .status(404)
      .json(createErrorResponse(404, 'fragment not found'));
  }
};