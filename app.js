const express = require('express')

const app = express()
const PORT = 3000

const articleRouter = require("./routes/articleRouter")
const commentRouter = require("./routes/commentRouter")


app.get("/", (req, res) => {
    res.status(200).json({
        message: "User Rest API is running ..."
    })
})

app.use("/articles", articleRouter)
app.use("/comments", commentRouter)


app.use((req, res) => {
    res.status(404).json({ message: "API not found" })
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
})