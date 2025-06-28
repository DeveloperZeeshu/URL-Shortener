import { readFile, writeFile } from 'fs/promises';
import http from 'http';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const _dirname = path.dirname(filename);
const DATA_FILE = path.join(_dirname, 'data', 'links.json');

const serveFile = async (res, filepath, contentType) => {
    try {
        const data = await readFile(filepath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    }
    catch (err) {
        res.writeHead(404, { 'Content-Type': contentType });
        res.end(err);
    }
}

const loadLinks = async () => {
    try {
        const data = await readFile(DATA_FILE, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        if (err.code === 'ENOENT') {
            await writeFile(DATA_FILE, JSON.stringify({}));
            return {};
        }
        throw err;
    }
}

const saveLinks = async (links) => {
    try {
        await writeFile(DATA_FILE, JSON.stringify(links));
    } catch (err) {
        console.log(err);
    }
}

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET') {
        if (req.url === '/') {
            return serveFile(res, path.join(_dirname, 'index.html'), 'text/html')
        }
        else if (req.url === '/style.css') {
            return serveFile(res, path.join(_dirname, 'style.css'), 'text/css');
        }
        else if (req.url === '/app.js') {
            return serveFile(res, path.join(_dirname, 'app.js'), 'application/javascript');
        }
        else if (req.url === '/links') {
            const links = await loadLinks();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify(links));
        }
        else {
            const links = await loadLinks();
            const shortCode = req.url.slice(1);
            if (links[shortCode]) {
                res.writeHead(302, { location: links[shortCode] });
                return res.end();
            }
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Page not found');
        }
    }

    if (req.method === 'POST' && req.url === '/shorten') {
        const links = await loadLinks();

        let body = '';
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
            console.log(body);
            const { url, shortCode } = JSON.parse(body);
            if (!url) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                return res.end('URL is required');
            }

            const finalShortCode = shortCode || crypto.randomBytes(4).toString('hex');

            if (links[finalShortCode]) {
                res.writeHead(409, { 'Content-Type': 'text/plain' });
                return res.end('Short code already exists, Please choose another.');
            }

            links[finalShortCode] = url;
            await saveLinks(links);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, shortCode: finalShortCode }));
        })
    }
})

const PORT = 3002;
server.listen(PORT, () => console.log(`Server running on ${PORT} port...`));


