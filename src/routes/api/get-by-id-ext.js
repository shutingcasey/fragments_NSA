// src/routes/api/get-by-id-ext.js
const MarkdownIt = require('markdown-it');
const sharp = require('sharp');
const yaml = require('js-yaml');

const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
const logger = require('../../logger');

const md = new MarkdownIt();

// Map a URL extension to the mime type it represents
const EXTENSION_TO_TYPE = {
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  csv: 'text/csv',
  json: 'application/json',
  yaml: 'application/yaml',
  yml: 'application/yaml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  avif: 'image/avif',
};

// Mime type -> sharp output format name, for image conversions
const IMAGE_SHARP_FORMAT = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
};

// A very small CSV -> JSON converter (comma-separated, first row is the header)
function csvToJson(csvText) {
  const [headerLine, ...rows] = csvText.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map((header) => header.trim());

  return rows
    .filter((row) => row.length > 0)
    .map((row) => {
      const values = row.split(',').map((value) => value.trim());
      return headers.reduce((obj, header, i) => {
        obj[header] = values[i];
        return obj;
      }, {});
    });
}

/**
 * GET /v1/fragments/:id.ext
 * Convert a fragment to a supported format.
 */
module.exports = async (req, res) => {
  const { id, ext } = req.params;

  let fragment;
  try {
    fragment = await Fragment.byId(req.user, id);
  } catch (err) {
    logger.warn({ err, id }, 'fragment not found');
    return res.status(404).json(createErrorResponse(404, 'fragment not found'));
  }

  const targetType = EXTENSION_TO_TYPE[ext];

  if (!targetType || !fragment.formats.includes(targetType)) {
    return res.status(415).json(createErrorResponse(415, `unsupported conversion to .${ext}`));
  }

  try {
    const data = await fragment.getData();

    // No conversion needed
    if (targetType === fragment.mimeType) {
      res.set('Content-Type', targetType);
      return res.status(200).send(data);
    }

    if (IMAGE_SHARP_FORMAT[targetType]) {
      const converted = await sharp(data).toFormat(IMAGE_SHARP_FORMAT[targetType]).toBuffer();
      res.set('Content-Type', targetType);
      return res.status(200).send(converted);
    }

    if (fragment.mimeType === 'text/markdown' && targetType === 'text/html') {
      res.set('Content-Type', 'text/html');
      return res.status(200).send(md.render(data.toString()));
    }

    if (fragment.mimeType === 'text/csv' && targetType === 'application/json') {
      res.set('Content-Type', 'application/json');
      return res.status(200).send(JSON.stringify(csvToJson(data.toString())));
    }

    if (fragment.mimeType === 'application/json' && targetType === 'application/yaml') {
      res.set('Content-Type', 'application/yaml');
      return res.status(200).send(yaml.dump(JSON.parse(data.toString())));
    }

    // Any other valid conversion target is text/plain: markdown, html, csv,
    // json and yaml are all already valid plain text, so we serve the raw
    // bytes as-is.
    res.set('Content-Type', targetType);
    return res.status(200).send(data);
  } catch (err) {
    logger.error({ err }, 'unable to convert fragment');
    return res.status(500).json(createErrorResponse(500, 'unable to convert fragment'));
  }
};
