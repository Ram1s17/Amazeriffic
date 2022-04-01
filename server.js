const express = require('express')
const app = express()
const port = 5000


app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/img', express.static(__dirname + 'public/img'))
app.use(express.static(__dirname))
app.use(express.json())



app.set('views', './views')
app.set('view engine', 'ejs')

app.get('', (req, res) => {
	res.render('index.ejs')
})

app.get('/todos.json', (req, res) => {
	res.sendFile(__dirname + '/todos.json')
})

app.listen(port, () => console.info(`Запуск сервера -> ${port}`))