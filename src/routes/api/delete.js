const { Fragment } = require('../../model/fragment');
const { createErrorResponse, createSuccessResponse } = require('../../response');

module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);

    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
    }

    await Fragment.delete(req.user, req.params.id);

    return res.status(200).json(createSuccessResponse());
  } catch {
    return res.status(404).json(createErrorResponse(404, 'Fragment not found'));
  }
};