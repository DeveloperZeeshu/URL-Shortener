import express from 'express'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

const app = express()

const staticPath = path.join(import.meta.dirname)
const DATA_FILE = path.join(staticPath, 'data', 'links.json')
app.use(express.static(path.join(staticPath, 'public')))
app.use(express.urlencoded({ extended: true }))

const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, 'utf-8')
        return JSON.parse(data)
    } catch (err) {
        if (err.code === 'ENOENT') {
            await writeFile(DATA_FILE, JSON.stringify({}))
            return {}
        }
        throw err
    }
}

const saveLinks = async (links) => {
    try {
        await writeFile(DATA_FILE, JSON.stringify(links))
    } catch (err) {
        console.log(err)
    }
}

app.get('/', async (req, res) => {
    try {
        const filepath = path.join(staticPath, 'views', 'index.html')
        const file = await readFile(filepath)
        const links = await loadLinks()

        const content = file.toString().replaceAll(
            '{{shortened_urls}}',
            Object.entries(links).map(
                ([shortCode, url]) =>
                    `<li><a style='color: #168fbeff; font-weight: 500' href="/${shortCode}" target="_blank">${req.host}/${shortCode}</a> -> ${url}</li>`
            ).join('')
        )

        return res.send(content)
    }
    catch (err) {
        console.log('Error loading page!')
        return res.status(500).send('Internal server error!')
    }
})

app.post('/', async (req, res) => {
    try {
        const { url, shortCode } = req.body
        const links = await loadLinks()
        const finalShortCode = shortCode || crypto.randomBytes(4).toString('hex')

        if (links[finalShortCode]) {
            return res.status(409).send('ShortCode already exists. Please choose another.')
        }

        links[finalShortCode] = url
        await saveLinks(links)

        return res.redirect('/')

    } catch (err) {
        console.error(err)
        return res.status(500).send('Internal server error!')
    }
})

app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params
        const links = await loadLinks()

        if (!links[shortCode]) return res.status(404).sendFile(path.join(staticPath, 'views', '404.html'))

        return res.redirect(links[shortCode])
    } catch (err) {
        console.error(err)
        return res.status(500).send('Internal server error!')
    }
})

app.use((req, res) => {
    return res.status(404).sendFile(path.join(staticPath, 'views', '404.html'));
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`Server running at ${PORT} port...`))

