const { z } = require('zod');

const updateUserSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).optional(),
});

module.exports = { updateUserSchema };