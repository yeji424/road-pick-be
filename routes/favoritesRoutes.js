import express from 'express'
import jwt from 'jsonwebtoken'
import { Favorite } from '../models/favorites.js'

const router = express.Router()

// ── 인증 미들웨어
function authenticate(req, res, next) {
  const token = req.cookies.token
  if (!token) return res.status(401).json({ message: '로그인 필요' })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.id
    next()
  } catch {
    return res.status(401).json({ message: '유효하지 않은 토큰' })
  }
}

// ── 찜 추가 (POST /favorites)
router.post('/', authenticate, async (req, res) => {
  const { contentid } = req.body
  try {
    // 중복 검사: 동일 contentid가 이미 찜되어 있는지 확인
    const exists = await Favorite.findOne({
      user: req.userId,
      'destination.contentid': contentid,
    })
    if (exists) {
      return res.status(409).json({ message: '이미 찜한 항목입니다.' })
    }

    const fav = new Favorite({
      user: req.userId,
      destination: { contentid },
    })
    await fav.save()
    res.status(201).json({ message: '찜 추가', favorite: fav })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: '서버 에러' })
  }
})

// ── 찜 목록 조회
router.get('/', authenticate, async (req, res) => {
  const list = await Favorite.find({ user: req.userId }).sort('-createdAt')
  res.json({ favorites: list })
})

router.delete('/:id', authenticate, async (req, res) => {
  const result = await Favorite.deleteOne({ _id: req.params.id, user: req.userId })
  if (result.deletedCount === 0)
    return res.status(404).json({ message: '찜 항목을 찾을 수 없습니다.' })
  res.json({ message: '찜 삭제' })
})

export default router
