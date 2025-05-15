import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId 타입
    ref: 'User', // 참조할 모델명
    required: true,
  },
  destination: { type: mongoose.Schema.Types.Mixed, required: true },
  content: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  imgUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
})

export const Review = mongoose.model('Review', reviewSchema)
