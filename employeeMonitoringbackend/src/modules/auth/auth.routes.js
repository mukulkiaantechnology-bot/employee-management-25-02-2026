const { Router } = require('express');
const ctrl = require('./auth.controller');
const { validate } = require('../../middleware/validate');
const { authenticate } = require('../../middleware/auth');
const { registerSchema, loginSchema, forgotPasswordSchema } = require('./auth.schema');

const router = Router();

router.post('/register', validate(registerSchema), ctrl.register);
router.post('/login', validate(loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.getMe);
// Forgot / reset password are placeholders — implement with email later
router.post('/forgot-password', validate(forgotPasswordSchema), (req, res) => {
    res.json({ success: true, data: { message: 'Reset email sent (if account exists)' } });
});

module.exports = router;
