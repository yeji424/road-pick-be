import mongoose from 'mongoose'

const tripDetailSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  destination: { type: mongoose.Schema.Types.Mixed, required: true }, // INT → JSON 또는 ref
  visitDate: { type: Date, required: true }, // DATE
  visitTime: { type: String }, // TIME (HH:mm 형식 권장)
  note: { type: String }, // TEXT
  budget: { type: Number }, // INT
  visitOrder: { type: Number, required: true }, // INT (방문 순서)
})
export const TripDetail = mongoose.model('TripDetail', tripDetailSchema)
