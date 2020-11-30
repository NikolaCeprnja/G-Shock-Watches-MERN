const { validationResult } = require('express-validator');

const User = require('../models/user-model');
const ErrorHandler = require('../models/error-handler');

// GET CONTROLLERS
const getUsers = async (req, res, next) => {
	let users;

	try {
		users = await User.find();
	} catch (error) {
		return next(
			new ErrorHandler(
				'Something went wrong, please try again later.',
				500
			)
		);
	}

	if (users) {
		return res.status(200).json({ message: 'List of all users', users });
	}

	return res
		.status(404)
		.json({ message: 'Currently there is no users yet.' });
};

const getUserById = async (req, res, next) => {
	const { uid } = req.params;
	let user;

	try {
		user = await User.findById(uid);
	} catch (error) {
		console.error(error);

		return next(
			new ErrorHandler(
				'Something went wrong, please try again later!',
				500
			)
		);
	}

	if (user) {
		return res.status(200).json({ user: user.toObject({ getters: true }) });
	}

	return res
		.status(404)
		.json({ message: 'User with provided uid does not exists.' });
};

// POST CONTROLLERS
const userSignin = async (req, res, next) => {
	const err = validationResult(req);

	if (!err.isEmpty()) {
		console.error(err);
		return next(
			new ErrorHandler(
				'Invalid inputs passed, please check your data.',
				422
			)
		);
	}

	const { email, password } = req.body;
	let foundUser;

	try {
		foundUser = await User.findOne({ email });
	} catch (error) {
		return next(
			new ErrorHandler(
				'Something went wrong, please try again later.',
				500
			)
		);
	}

	if (foundUser) {
		if (foundUser.password === password) {
			return res.status(200).json({
				loggedInUser: foundUser.toObject({ getters: true }),
				message: `Hello ${foundUser.userName}, you are successfully logged in!`,
			});
		}

		return res.status(401).json({
			message: 'Incorrect password, please try again.',
		});
	}

	return res.status(404).json({
		message: 'User with provided email address does not exists.',
	});
};

const userSignup = async (req, res, next) => {
	const err = validationResult(req);

	if (!err.isEmpty()) {
		console.error(err);
		return next(
			new ErrorHandler(
				'Invalid inputs passed, please check your data.',
				422
			)
		);
	}

	const { userName, email, password, isAdmin } = req.body;
	let existingUser;

	try {
		existingUser = await User.exists({ $or: [{ email }, { userName }] });
	} catch (error) {
		return next(
			new ErrorHandler(
				'Something went wrong, please try again later.',
				500
			)
		);
	}

	if (existingUser) {
		return res.status(409).json({
			message:
				'User with provided email and/or username already exists, please try again with different values.',
		});
	}

	const createdUser = new User({
		userName,
		email,
		password,
		isAdmin,
	});

	try {
		await createdUser.save();
	} catch (error) {
		return next(
			new ErrorHandler(
				'Creating user profile failed, please try again.',
				500
			)
		);
	}

	return res.status(201).json({
		createdUser,
		message: `User ${createdUser.userName} is successfully signedUp`,
	});
};

module.exports = {
	getUsers,
	getUserById,
	userSignin,
	userSignup,
};
