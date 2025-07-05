import crypto from 'crypto'
import path from 'path'
import { getLinkByShortCode, loadLinks, saveLinks } from './models/shortener.model.js'

const staticPath = path.join(import.meta.dirname)

export const getShortenerPage = async (req, res) => {
    try {
        const links = await loadLinks()

        return res.render('index', { links, host: req.host })
    }
    catch (err) {
        console.log('Error loading page!')
        return res.status(500).send('Internal server error!')
    }
}

export const postURLShortener = async (req, res) => {
    try {
        const { url, shortCode } = req.body
        const links = await loadLinks()
        const finalShortCode = shortCode || crypto.randomBytes(4).toString('hex')

        if (links[finalShortCode]) {
            return res.status(409).send('ShortCode already exists. Please choose another.')
        }

        await saveLinks({ url, shortCode })

        return res.redirect('/')

    } catch (err) {
        console.error(err)
        return res.status(500).send('Internal server error!')
    }
}

export const redirectToShortLink = async (req, res) => {
    try {
        const { shortCode } = req.params

        const link = await getLinkByShortCode(shortCode)

        if (!link) return res.status(404).sendFile(path.join(staticPath, '..', 'views', '404.html'))

        return res.redirect(link.url)
    } catch (err) {
        console.error(err)
        return res.status(500).send('Internal server error!')
    }
}
