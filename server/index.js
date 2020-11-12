const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const env = require('dotenv');
const mongoose = require('mongoose');

if (process.env.NODE_ENV !== 'production') env.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(cors());

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
