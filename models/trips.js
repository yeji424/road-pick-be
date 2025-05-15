import mongoose from 'mongoose'

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // ObjectId 타입
    ref: 'User', // User 모델 참조
    required: true,
  },
  title: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  note: { type: String },
})

export const Trip = mongoose.model('Trip', tripSchema)
