import http from 'node:http'
import { mangadexHandler } from '../vite/mangadexProxy.js'

// nginx quita el prefijo /mdx: aquí llegan /api/... y /img?u=...
http.createServer(mangadexHandler).listen(3000, '0.0.0.0', () => console.log('proxy de MangaDex en :3000'))
