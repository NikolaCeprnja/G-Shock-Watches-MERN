const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema({
	image: { type: String, required: true },
	title: { type: String, required: true },
	description: { type: String, required: true },
	creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
});

module.exports = mongoose.model('Post', postSchema);
