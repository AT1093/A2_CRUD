const path = require("path");
const fs = require("fs");

const Article = require("../db/models/Article");

exports.getArticles = async (req, res, next) => {
    await Article.find()
        .then((articles) => {
            res.status(200).json({ articles });
        })
        .catch((err) =>
            res.status(401).json({ message: "Unable to load articles", error: err.message })
        );
};

exports.postArticle = async (req, res) => {
    const { heading, subHeading, content } = req.body;
    const { user } = req;

    if (!user) {
        return res.status(400).json({ message: "Author not found" });
    }

    if (!heading || !content) {
        return res.status(400).json({
            message: "Please fill all the required fields",
        });
    }

    let coverImage = '';
    if (req.file) {
        coverImage = req.file.path;
    }

    try {
        const article = await Article.create({
            heading,
            subHeading,
            content,
            coverImage,
            author: user.id,
        });

        res.status(201).json({
            message: "Article posted successfully",
            article
        });
    } catch (error) {
        res.status(400).json({ message: "An error occurred", error: error.message });
    }
};

exports.updateArticle = async (req, res, next) => {
    const { id } = req.params;

    try {
        const article = await Article.findById(id);

        if (!article) {
            return res.status(400).json({ message: "Article not found" });
        }

        let payload = req.body;

        if (req.file) {
            if (article.coverImage) {
                const filename = article.coverImage.split("/").pop();
                const imagePath = path.join(
                    __dirname,
                    "..",
                    filename
                );

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            payload.coverImage = req.file.path;
        }

        const updatedArticle = await Article.findByIdAndUpdate(id, { $set: payload }, { new: true })
        res.status(201).json({
            message: "Article updated successfully",
            article: updatedArticle
        });
    } catch (error) {
        console.log("Error updated article: ", error);
        res.status(400).json({ message: "An error occurred", error: error.message });
    }
};

exports.deleteArticle = async (req, res, next) => {
    const { id } = req.params;
    await Article.findByIdAndDelete(id)
        .then((article) => {
            if (article.coverImage) {
                const filename = article.coverImage.split("/").pop();
                const imagePath = path.join(
                    __dirname,
                    "..",
                    filename
                );

                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            return res.status(201).json({ message: "Article successfully deleted", article })
        }
        )
        .catch((error) => {
            console.log("Error delete article: ", error)
            res
                .status(400)
                .json({ message: "An error occurred", error: error.message })
        }
        );
};