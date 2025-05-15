import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import xss from 'xss'
import cookieParser from 'cookie-parser'
import sanitize from '@exortek/express-mongo-sanitize'
import favoritesRoutes from './routes/favoritesRoutes.js'
//import csurf from 'csurf'

import accountRoutes from './routes/accountRoutes.js'
import scheduleRoutes from './routes/scheduleRoutes.js'
import scheduleDetailRoutes from './routes/scheduleDetailRoutes.js'

dotenv.config()
const app = express()

app.use(helmet())
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
)

function sanitizeBody(req, res, next) {
  const clean = obj => {
    if (typeof obj === 'string') return xss(obj)
    if (Array.isArray(obj)) return obj.map(clean)
    if (obj !== null && typeof obj === 'object') {
      for (const key in obj) {
        obj[key] = clean(obj[key])
      }
      return obj
    }
    return obj
  }
  if (req.body) req.body = clean(req.body)
  next()
}

app.use(express.json({ limit: '10kb' }))
app.use(sanitize({ locations: ['body', 'params'] })) // mongo-sanitize
app.use(sanitizeBody)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: '너무 많은 요청을 보냈습니다. 잠시 후 다시 시도하세요.',
  })
)
app.use(cookieParser())

// // CSRF 토큰 발급 (필요 없다면 주석 처리)
// const csrfProtection = csurf({
//   cookie: {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'Strict',
//   },
// })
// app.use(csrfProtection)
// app.use((req, res, next) => {
//   res.cookie('XSRF-TOKEN', req.csrfToken(), {
//     httpOnly: false,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'Strict',
//   })
//   next()
// })

app.use('/auth', accountRoutes)
app.use('/favorites', favoritesRoutes)
app.use('/schedule', scheduleRoutes)
app.use('/scheduledetail', scheduleDetailRoutes)

const PORT = process.env.PORT || 5000
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 완료')
    app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`))
  })
  .catch(err => console.error('❌ MongoDB 연결 실패:', err))
