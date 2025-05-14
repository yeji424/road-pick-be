import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
    user:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    // destination_id: diagram 에 Type 으로만 나와 있어, 예시로 JSON embed를 쓰거나(아래처럼), 
    // 별도 Destination 콜렉션을 만들고 ObjectId로 ref 해도 됩니다.
    destination: { type: mongoose.Schema.Types.Mixed, required: true }, // JSON
    content:     { type: String, required: true },       // TEXT
    rating:      { type: Number, required: true, min: 1, max: 5 }, // TINYINT 1~5
    imgUrl:      { type: String },                       // VARCHAR(255), nullable
    createdAt:   { type: Date,   default: Date.now },    // DATETIME
  })
  export const Review = mongoose.model('Review', reviewSchema)