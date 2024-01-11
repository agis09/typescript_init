import express from 'express'

const app: express.Express = express()

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "origin, X-Requested-With, Content-Type, Accept")
    next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const router: express.Router = express.Router()
router.get('/api/getTest', (req: express.Request, res: express.Response) => {
    res.send(req.query)
})
router.post('/api/postTest', (req: express.Request, res: express.Response) => {
    res.send(req.body)
})
app.use(router)

app.listen(3000, () => { console.log('Example app listening on port 3000') })