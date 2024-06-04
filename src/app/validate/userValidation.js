const { check, validationResult } = require("express-validator");

exports.userValidationRules = () => {
  return [
    check("email").isEmail().withMessage("Email is not valid"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
    check("name").notEmpty().withMessage("Name is required"),
    check("phone").isNumeric().withMessage("Phone number must be numeric"),
    check("address").notEmpty().withMessage("Address is required"),
    check("avatar").notEmpty().withMessage("Avatar is required"),
  ];
};

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};
