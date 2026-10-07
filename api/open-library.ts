import type { VercelRequest, VercelResponse } from '@vercel/node'
import booksHandler from './books'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return booksHandler(req, res)
}
