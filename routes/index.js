const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();
const publicUrl = process.env.PUBLIC_URL;

const Article = require("../db/models/Article");

router.get('/', async function (req, res) {
    const token = req.cookies.jwt;
    const articles = await Article.find().populate('author');

    if (!token) {
        res.render('index', { title: 'Home', profile: null, publicUrl, articles });
        return;
    }

    const profile = jwt.verify(token, process.env.JWT_SECRET);
    res.render('index', { title: 'Home', articles, publicUrl, publicUrl, profile })
})

router.get('/profile', function (req, res) {
    const token = req.cookies.jwt;
    if (!token) {
        res.render('index', { title: "Profile", profile: null });
        return;
    }

    const profile = jwt.verify(token, process.env.JWT_SECRET);
    res.render('profile', { title: 'Profile', publicUrl, profile })
})

router.get('/article/:id', async function (req, res) {
    let profile = null;
    const token = req.cookies.jwt;

    if (token) {
        profile = jwt.verify(token, process.env.JWT_SECRET);
    }

    try {
        const article = await Article.findById(req.params.id).populate({
            path: 'author',
            select: 'firstName lastName'
        });

        res.render('article', { title: article.heading, profile, publicUrl, article });
    } catch (err) {
        console.log("Error loading article: ", err.message);
        res.render('article', { title: 'Article', profile, publicUrl, article: null });
    }
})

router.get('/edit-article/:id', async function (req, res) {
    let profile = null;
    const token = req.cookies.jwt;

    if (token) {
        profile = jwt.verify(token, process.env.JWT_SECRET);
    }

    try {
        const article = await Article.findById(req.params.id).populate({
            path: 'author',
            select: 'firstName lastName'
        });

        res.render('edit-article', { title: 'Edit ' + article.heading, profile, publicUrl, article });
    } catch (err) {
        console.log("Error loading article: ", err.message);
        res.render('article', { title: 'Article', profile, publicUrl, article: null });
    }
})

router.get('/post-article', function (req, res) {
    const token = req.cookies.jwt;
    if (!token) {
        res.render('index', { profile: null });
        return;
    }

    const profile = jwt.verify(token, process.env.JWT_SECRET);
    res.render('post-article', { title: 'Post Article', publicUrl, profile })
})

router.get('/login', function (req, res) {
    res.render('login', { title: 'Login', profile: null })
})

router.get('/register', function (req, res) {
    res.render('register', { title: 'Register', profile: null })
})

module.exports = router;