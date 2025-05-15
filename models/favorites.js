import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId 타입
    ref: 'User', // User 모델 참조
    required: true,
  },
  destination: {
    contentid: { type: Number, required: true },
    contenttypeid: { type: Number, required: true },
    firstimage: { type: String },
    title: { type: String, required: true },
    addr1: { type: String },
    addr2: { type: String },
    mapx: { type: Number },
    mapy: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
})

export const Favorite = mongoose.model('Favorite', favoriteSchema)
