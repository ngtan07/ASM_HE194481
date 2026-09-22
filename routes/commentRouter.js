const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const filePath = path.join(__dirname, '../data.json');

let dataRaw = {};
let comments = [];
let articles = [];

const readDataFile = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        dataRaw = JSON.parse(data);
        comments = dataRaw.comments || [];
        articles = dataRaw.articles || [];
    } catch (err) {
        console.error(err.message);
        comments = [];
        articles = [];
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

// GET all
router.get('/', (req, res) => {
    res.status(200).json(comments);
});

// GET by ID
router.get('/:id', (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const comment = comments.find(c => c.id === id);

        if (!comment) {
            return res.status(404).json({ message: 'Not found' });
        }
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST
router.post('/', async (req, res) => {
    const articleId = parseInt(req.body.articleId);

    const newComment = {
        id: comments.length > 0 ? comments[comments.length - 1].id + 1 : 1,
        articleId: articleId,
        content: req.body.content,
        author: req.body.author,
        date: req.body.date
    };

    const article = articles.find(a => a.id === articleId);

    if (article) {
        comments.push(newComment);
        await writeDataFile();
        return res.status(201).json(newComment);
    } else {
        return res.status(404).json({ message: 'Article not found' });
    }
});

// PUT
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    const index = comments.findIndex(cmt => cmt.id === id);
    if (index === -1) return res.status(404).json({ message: 'Not found' });

    comments[index] = {
        ...comments[index],
        ...req.body,
        id,
        articleId: comments[index].articleId
    };

    await writeDataFile();
    res.status(200).json(comments[index]);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const index = comments.findIndex(comment => comment.id === id);
    if (index === -1) return res.status(404).json({ message: 'Not found' });

    comments.splice(index, 1);
    await writeDataFile();
    res.status(200).json({ message: 'Deleted successfully' });
});

module.exports = router;