import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId 타입
    ref: 'User', // User 모델 참조
    required: true,
  },
  destination: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Favorite = mongoose.model('Favorite', favoriteSchema)
