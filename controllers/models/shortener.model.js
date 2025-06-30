import { writeFile, readFile } from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join('data', 'links.json')

export const loadLinks = async () => {
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

export const saveLinks = async (links) => {
    try {
        await writeFile(DATA_FILE, JSON.stringify(links))
    } catch (err) {
        console.log(err)
    }
}