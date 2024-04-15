const mongoose = require("mongoose");

const ArticleSchema = new mongoose.Schema({
  heading: {
    type: String,
    required: true,
  },
  subHeading: String,
  coverImage: {
    type: String,
    default: null
  },
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: null,
  },
});

const Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
