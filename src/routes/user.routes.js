const express = require('express');
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { updateUserSchema } = require('../validations/user.validation');

const router = express.Router();

// Protect all routes below with authentication middleware
router.use(authenticate);

// READ: GET /api/v1/users/profile
router.get('/profile', userController.getProfile);

// UPDATE: PUT /api/v1/users/profile
router.put('/profile', validate(updateUserSchema), userController.updateProfile);

// DELETE: DELETE /api/v1/users/profile
router.delete('/profile', userController.deleteProfile);

module.exports = router;