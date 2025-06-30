import path from 'path'
import { Router } from 'express'
import { getShortenerPage, postURLShortener, redirectToShortLink } from '../controllers/postshortener.controller.js'

const router = Router()

const staticPath = path.join(import.meta.dirname)

router.get('/', getShortenerPage)

router.post('/', postURLShortener)

router.get('/:shortCode', redirectToShortLink)

router.use((req, res) => {
    return res.status(404).sendFile(path.join(staticPath, '..', 'views', '404.html'));
})

export default router;

