const validate = (schema) => (req, res, next) => {
  try {
    // Parse the incoming data against the provided schema
    schema.parse(req.body);
    next(); // Data is good, proceed to the controller
  } catch (error) {
    // Data is bad, map the Zod errors into a readable format
    const errorMessages = error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages,
    });
  }
};

module.exports = validate;