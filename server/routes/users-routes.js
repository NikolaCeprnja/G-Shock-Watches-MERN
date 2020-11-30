const router = require('express').Router();
const { check } = require('express-validator');

const {
	getUsers,
	getUserById,
	userSignin,
	userSignup,
} = require('../controllers/users-controller');

router.get('/', getUsers);

router.get('/:uid', getUserById);

router.post(
	'/signin',
	[
		check('email').trim().notEmpty().normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 }),
	],
	userSignin
);

router.post(
	'/signup',
	[
		check('userName').trim().isLength({ min: 6 }),
		check('email').trim().notEmpty().normalizeEmail().isEmail(),
		check('password').isLength({ min: 6 }),
	],
	userSignup
);

module.exports = router;
