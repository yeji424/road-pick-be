import express from 'express'
import { TripDetail } from '../models/tripsDetail.js'

const router = express.Router()

// 일정 생성
router.post('/', async (req, res) => {
  try {
    const newDetail = new TripDetail(req.body)
    const saved = await newDetail.save()
    res.status(201).json(saved)
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// 특정 Trip의 일정 전체 조회 (날짜순 정렬)
router.get('/list/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params
    // tripId 기준으로 전체 일정 조회 후 날짜 순으로 정렬
    const details = await TripDetail.find({ trip: tripId }).sort({
      visitDate: 1,
      visitOrder: 1,
    })
    res.json(details)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 특정 Trip의 특정 날짜 일정 조회
router.get('/list/:tripId/:visitDate', async (req, res) => {
  try {
    const { tripId, visitDate } = req.params
    //문자열을 Date 객체로 변환
    const dateStart = new Date(visitDate)
    const dateEnd = new Date(visitDate)
    dateEnd.setDate(dateEnd.getDate() + 1)
    // tripId와 visitDate 범위로 조회
    const details = await TripDetail.find({
      trip: tripId,
      visitDate: { $gte: dateStart, $lt: dateEnd },
    }).sort({ visitOrder: 1 }) // 방문 순서 기준 정렬

    res.json(details)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 일정 삭제
router.delete('/:detailId', async (req, res) => {
  try {
    const { detailId } = req.params
    await TripDetail.findByIdAndDelete(detailId)
    res.json({ message: 'Deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 일정 수정
router.put('/:detailId', async (req, res) => {
  try {
    const { detailId } = req.params
    // 해당 ID의 데이터를 업데이트하고 갱신된 결과 반환
    const updated = await TripDetail.findByIdAndUpdate(detailId, req.body, {
      new: true,
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
