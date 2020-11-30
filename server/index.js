const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv');
const mongoose = require('mongoose');

const userRoutes = require('./routes/users-routes');

if (process.env.NODE_ENV !== 'production') env.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/users', userRoutes);

app.use((req, res, next) => {
	res.status(404).json({ message: 'Error, this page does not exists.' });
});

app.use((err, req, res, next) => {
	console.error(err);

	if (res.headersSent) {
		return next(err);
	}

	return res.status(err.statusCode || 500).json({
		message:
			err.message ||
			'Server error, something went wrong, please try again later.',
		error: err,
	});
});

mongoose
	.connect(process.env.DB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		app.listen(port, error => {
			if (error) throw new Error(error);

			console.log(`Server is running on port: ${port}.`);
		});
	})
	.catch(error => {
		console.error(error);
	});
