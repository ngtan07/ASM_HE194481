const express = require('express');
const fs = require('fs')

const router = express();
const path = require('path')


router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const filePath = path.join(__dirname, '../data.json')

let dataRaw = {}
let comments = []
let articles = []

const readDataFile = () => {
    try {
        const data = fs.readFileSync(filePath, 'utf-8')
        dataRaw = JSON.parse(data)
    } catch (err) {
        console.error(err.message)
        comments = []
        articles = []

    }
}

const writeDataFile = (newData) => {
    try {
        fs.promises.writeFile(filePath, JSON.stringify(newData, null, 4))
    } catch (err) {
        console.error(err.message)
    }
}


readDataFile()
comments = dataRaw.comments
articles = dataRaw.articles

// GET all articles
router.get('/', async (req, res) => {
    res.status(200).json(articles);
});


// GET a article by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = articles.find(a => a.id === id);

        if (!article) {
            return res.status(404).end('Not found');
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
        return res.status(400).end('Not found')
    }

    articles.push(newArticle);
    await writeDataFile(articles)
    return res.status(201).end('');
});


// PUT an article
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id)

    const index = articles.findIndex(article => article.id === id);
    if (index === -1) return res.status(404);

    articles[index] = {
        ...articles[index],
        ...req.body
    };

    await writeDataFile(articles)
    res.status(200);
});

// DELETE an article
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const index = articles.findIndex(article => article.id === id);
    if (index === -1) return res.status(404).end('Not found');

    const deletedArticle = articles.splice(index, 1);
    await writeDataFile(articles)
    res.status(200);
});

router.get('/:id/comments', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const article = articles.find(a => a.id === id);

        if (!article) {
            return res.status(404).end('');
        }

        const cmt = comments.find(c => c.articleId === article.id)
        res.status(200).json(cmt);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
})


module.exports = router;