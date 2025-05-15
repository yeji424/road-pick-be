import express from 'express'
import bcrypt from 'bcryptjs'
import { body, validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.js'

const router = express.Router()

// ── 회원가입
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('유효한 이메일을 입력하세요.'),
    body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상입니다.'),
    body('name').trim().notEmpty().withMessage('이름을 입력하세요.'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { password, name, email } = req.body
    try {
      const exists = await User.findOne({ $or: [{ email }] })
      if (exists)
        return res.status(409).json({ message: '이미 사용 중인 아이디 또는 이메일입니다.' })

      const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS))
      await new User({ email, password: hashed, name }).save()
      return res.status(201).json({ message: '회원가입 성공' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: '서버 에러' })
    }
  }
)

// ── 로그인
router.post(
  '/login',
  [
    body('email').trim().notEmpty().withMessage('아이디를 입력하세요.'),
    body('password').notEmpty().withMessage('비밀번호를 입력하세요.'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

    const { email, password } = req.body
    try {
      const user = await User.findOne({ email }).select('+password')
      if (!user) return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' })

      const match = await bcrypt.compare(password, user.password)
      if (!match) return res.status(401).json({ message: '아이디 또는 비밀번호가 잘못되었습니다.' })

      const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      })

      // 로그인 시 쿠키에 토큰 심기
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
          path: '/',
          maxAge: 1000 * 60 * 60, // 1시간
        })
        .json({ message: '로그인 성공' })
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: '서버 에러' })
    }
  }
)

// ── 프로필 조회
router.get('/profile', async (req, res) => {
  try {
    const token = req.cookies?.token
    if (!token) return res.status(401).json({ message: '로그인 필요' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(payload.id).select('-password -__v')
    if (!user) return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })

    res.json({ user })
  } catch (err) {
    console.error(err)
    res.status(401).json({ message: '유효하지 않은 토큰' })
  }
})
// ── 사용자 프로필 수정
router.put('/profile', async (req, res) => {
  try {
    const token = req.cookies?.token
    if (!token) return res.status(401).json({ message: '로그인 필요' })

    const payload = jwt.verify(token, process.env.JWT_SECRET)

    const { name } = req.body
    if (!name || name.trim() === '') {
      return res.status(400).json({ message: '이름은 필수입니다.' })
    }

    const updatedUser = await User.findByIdAndUpdate(
      payload.id,
      { name: name.trim() },
      { new: true }
    ).select('-password -__v')

    if (!updatedUser) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' })
    }

    res.json(updatedUser)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: '프로필 수정 실패' })
  }
})
// ── 로그아웃
router.post('/logout', (req, res) => {
  res
    .cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
      maxAge: 0,
    })
    .json({ message: '로그아웃 되었습니다.' })
})

router.post('/refresh', (req, res) => {
  const oldToken = req.cookies.token
  if (!oldToken) return res.status(401).json({ message: '토큰 없음' })

  try {
    const payload = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true })
    // 새로운 토큰 발급 (expiresIn: 1h)
    const newToken = jwt.sign({ id: payload.id, email: payload.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res
      .cookie('token', newToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60,
      })
      .json({ message: '토큰 갱신 완료' })
  } catch {
    return res.status(401).json({ message: '유효하지 않은 토큰' })
  }
})

export default router
