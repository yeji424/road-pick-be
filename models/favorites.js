import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    destination: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON으로 여행지 정보 전체를 저장
    createdAt:   { type: Date,   default: Date.now },
  })
  export const Favorite = mongoose.model('Favorite', favoriteSchema)