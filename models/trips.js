import mongoose from 'mongoose'

const tripSchema = new mongoose.Schema({
    user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:     { type: String, required: true },  // VARCHAR(100)
    startDate: { type: Date,   required: true },  // DATE
    endDate:   { type: Date,   required: true },  // DATE
    note:      { type: String },                  // TEXT, nullable
  })
  export const Trip = mongoose.model('Trip', tripSchema)