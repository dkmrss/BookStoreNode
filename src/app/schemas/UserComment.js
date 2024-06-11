const Joi = require("joi");

const commentSchema = Joi.object({
  book_id: Joi.number().integer().max(11).required(),
  user_id: Joi.number().integer().max(11).required(),
  content: Joi.string().required(), // TEXT, required
});

module.exports = commentSchema;
