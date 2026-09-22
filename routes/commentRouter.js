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

// GET all
router.get('/', async (req, res) => {
    res.status(200).json(comments);
});


// GET by ID
router.get('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const comment = comments.find(c => c.id === id);

        if (!comment) {
            return res.status(404).end('not found');
        }
        res.status(200).json(comment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST
router.post('/', async (req, res) => {

    const newComment = {
        id: comments.length > 0 ? comments[comments.length - 1].id + 1 : 1,
        articleId: req.body.articleId,
        content: req.body.content,
        author: req.body.author,
        date: req.body.date
    };

    const article = articles.find(a => newComment.articleId === a.id)

    if (article) {
        comments.push(newComment);
        await writeDataFile(comments)
        return res.status(201);
    } else {
        return res.status(404).end('not found');
    }

});


// PUT
router.put('/:id', async (req, res) => {
    const id = parseInt(req.params.id)

    const index = comments.findIndex(cmt => cmt.id === id);
    if (index === -1) return res.status(404).end('not found');

    comments[index] = {
        ...comments[index],
        ...req.body
    };

    await writeDataFile(comments)
    res.status(200);
});

// DELETE
router.delete('/:id', async (req, res) => {
    const id = parseInt(req.params.id)
    const index = comments.findIndex(comment => comment.id === id);
    if (index === -1) return res.status(404).end('not found');

    const deletedCmt = comments.splice(index, 1);
    await writeDataFile(comments)
    res.status(200);
});


module.exports = router;