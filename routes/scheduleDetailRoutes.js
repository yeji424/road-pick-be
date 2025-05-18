import express from 'express'
import { TripDetail } from '../models/tripsDetail.js'
import { Trip } from '../models/trips.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    // 프론트에서 보낸 건 tripId (문자열)임
    const trip = await Trip.findOne({ tripId: req.body.trip })
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }

    const body = {
      ...req.body,
      trip: trip._id,
      visitOrder: req.body.visitOrder.split(' ')[1],
    }

    const newDetail = new TripDetail(body)
    const saved = await newDetail.save()
    res.status(201).json(saved)
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message })
  }
})

// 특정 Trip의 일정 전체 조회 (날짜순 정렬)
router.get('/list/:tripId', async (req, res) => {
  try {
    const { tripId } = req.params

    // 먼저 Trip 객체를 uuid로 찾기
    const trip = await Trip.findOne({ tripId })
    if (!trip) {
      return res.status(404).json({ message: '해당 트립 정보 없음' })
    }

    // TripDetail은 Trip의 _id(ObjectId)를 참조하고 있음
    const details = await TripDetail.find({ trip: trip._id }).sort({
      visitDate: 1,
      visitOrder: 1,
    })

    res.json(details)
  } catch (error) {
    console.error('트립 세부 리스트 Error:', error)
    res.status(500).json({ message: error.message })
  }
})

// 특정 Trip의 특정 날짜 일정 조회
router.get('/list/:tripId/:visitDate', async (req, res) => {
  try {
    const { tripId, visitDate } = req.params

    const trip = await Trip.findOne({ tripId: req.params.tripId })
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    // visitDate는 yyyy-mm-dd 형식 문자열이라고 가정
    // 그 날짜의 00:00:00 ~ 23:59:59 범위로 조회해야 함
    const start = new Date(visitDate)
    start.setHours(0, 0, 0, 0)

    const end = new Date(visitDate)
    end.setHours(23, 59, 59, 999)

    const details = await TripDetail.find({
      trip: trip._id,
      visitDate: { $gte: start, $lte: end },
    }).sort({ visitOrder: 1 })

    res.json(details)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// 일정 삭제
router.delete('/:detailId/:tripId/:visitDate', async (req, res) => {
  try {
    const { detailId, tripId, visitDate } = req.params
    console.log(detailId)
    // 1. Trip 존재 여부 확인
    const trip = await Trip.findOne({ tripId })
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' })
    }
    // detailId로 찾기
    const detail = await TripDetail.findById(detailId)
    if (!detail) {
      return res.status(404).json({ message: 'TripDetail not found' })
    }

    // 삭제
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
