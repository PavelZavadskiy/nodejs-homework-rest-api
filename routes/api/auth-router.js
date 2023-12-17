const authController = require('../../controllers/auh-controller');
const { isEmptyBody, validateBody } = require('../../middlewares')
const { userSignupSchema, userSigninSchema } = require('../../service/schemas/user');
const { authenticate } = require('../../middlewares/authenticate');
const { upload } = require('../../middlewares')

const express = require('express');
const router = express.Router();

router.post('/register', isEmptyBody, validateBody(userSignupSchema), authController.signUp);

router.post('/login', isEmptyBody, validateBody(userSigninSchema), authController.signIn);

router.get('/current', authenticate, authController.getCurrent);

router.post('/logout', authenticate, authController.signOut);

router.patch('/', authenticate, authController.updateSubscription);

router.patch('/avatars', upload.single('avatar'), authenticate, authController.updateAvatar);


module.exports = router;