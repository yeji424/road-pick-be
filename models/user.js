import mongoose from 'mongoose'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'

dayjs.extend(utc)
dayjs.extend(timezone)

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    name: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
  }
)

// toJSON 변환 시 시간 포맷 변경
userSchema.set('toJSON', {
  transform(doc, ret) {
    ret.createdAt = dayjs(ret.createdAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')
    ret.updatedAt = dayjs(ret.updatedAt).tz('Asia/Seoul').format('YYYY-MM-DD HH:mm')
    delete ret.__v
    return ret
  },
})

export const User = mongoose.model('User', userSchema)