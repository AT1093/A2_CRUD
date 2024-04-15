const express = require("express");
const multer = require("multer");
const path = require("path");

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});
const upload = multer({ storage: storage });

const auth = require("../middlewares/auth");

const { register, login, updateUser, deleteUser, logout } = require("../controllers/auth");
const { getArticles, postArticle, updateArticle, deleteArticle } = require("../controllers/article");

router.post("/login", login);
router.post("/register", upload.single("profilePicture"), register);

router.put("/user/update", auth, upload.single("profilePicture"), updateUser);
router.delete("/user/delete", auth, deleteUser);

router.post("/articles", getArticles);
router.post("/article", auth, upload.single('coverImage'), postArticle);
router.put(`/article/:id`, auth, upload.single('coverImage'), updateArticle);
router.delete(`/article/:id`, auth, deleteArticle);

router.post("/logout", logout);

module.exports = router;