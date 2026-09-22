const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const filePath = path.join(__dirname, '../data.json');

let dataRaw = { articles: [], comments: [] };
let comments = [];
let articles = [];

const readDataFile = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        dataRaw = JSON.parse(data);
        articles = dataRaw.articles || [];
        comments = dataRaw.comments || [];
    } catch (err) {
        console.error(err.message);
        articles = [];
        comments = [];
    }
};

const writeDataFile = async () => {
    try {
        const newData = { articles, comments };
        await fs.promises.writeFile(filePath, JSON.stringify(newData, null, 4));
    } catch (err) {
        console.error(err.message);
    }
};

readDataFile();

// GET all articles
router.get('/', (req, res) => {
    res.status(200).json(articles);
});

// GET an article by ID
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = articles.find(a => a.id === id);

        if (!article) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.status(200).json(article);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new article
router.post('/', async (req, res) => {
    const newArticle = {
        id: articles.length > 0 ? articles[articles.length - 1].id + 1 : 1,
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        date: req.body.date
    };

    if (!newArticle.title || !newArticle.content || !newArticle.author || !newArticle.date) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    articles.push(newArticle);
    await writeDataFile();
    return res.status(201).json(newArticle);
});

// PUT an article
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const index = articles.findIndex(article => article.id === id);
    if (index === -1) return res.status(404).json({ message: 'Not found' });

    articles[index] = {
        ...articles[index],
        ...req.body,
        id
    };

    await writeDataFile();
    res.status(200).json(articles[index]);
});

// DELETE an article
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const index = articles.findIndex(article => article.id === id);

    if (index === -1) return res.status(404).json({ message: 'Not found' });

    articles.splice(index, 1);
    await writeDataFile();
    res.status(200).json({ message: 'Deleted successfully' });
});

// GET comments for an article
router.get('/:id/comments', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = articles.find(a => a.id === id);

        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
        }

        const articleComments = comments.filter(c => c.articleId === id);
        res.status(200).json(articleComments);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;