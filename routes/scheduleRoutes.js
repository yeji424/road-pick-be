import express from 'express'
import { Trip } from '../models/trips.js'

const router = express.Router()

router.post('/', async (req, res) => {
  try {
    // const { token } = req.cookies
    // if (!token) {
    //   return res.json({ error: '로그인 필요' })
    // }
    console.log(req.body)
    const { title, startDate, endDate, userId, tripId } = req.body
    const scheduleData = {
      title,
      startDate,
      endDate,
      user: userId,
      tripId: tripId,
    }
    const post = await Trip.create(scheduleData)
    console.log('일정 추가 완료', post)
    res.json({ message: '일정 추가 완료' })
  } catch (err) {
    console.log('일정 추가 에러', err)
    return res.status(500).json({ error: '일정 추가 실패' })
  }
})

router.get('/list', async (req, res) => {
  try {
    // const { token } = req.cookies
    // if (!token) {
    //   return res.json({ error: '로그인 필요' })
    // }
    const scheduls = await Trip.find().sort({ createdAt: -1 })
    res.json(scheduls)
  } catch (err) {
    console.log('일정 목록 조회 에러', err)
    res.status(500).json({ error: '일정 목록 조회 실패' })
  }
})

router.get('/detail/:scheduleId', async (req, res) => {
  try {
    // const { token } = req.cookies
    // if (!token) {
    //   return res.json({ error: '로그인 필요' })
    // }
    const { scheduleId } = req.params
    if (!scheduleId) return
    const schedule = await Trip.findOne({ tripId: scheduleId })
    if (!schedule) {
      return res.status(404).json({ error: '일정을 찾을 수 없습니다.' })
    }
    res.json(schedule)
  } catch (err) {
    console.log('일정 상세 조회 에러', err)
    res.status(500).json({ error: '일정 상세 조회 실패' })
  }
})

router.delete('/delete/:scheduleId', async (req, res) => {
  try {
    // const { token } = req.cookies
    // if (!token) {
    //   return res.json({ error: '로그인 필요' })
    // }
    const { scheduleId } = req.params
    if (!scheduleId) {
      return res.status(400).json({ error: '일정 ID가 필요합니다.' })
    }

    const deletedSchedule = await Trip.findOneAndDelete({ tripId: scheduleId })
    if (!deletedSchedule) {
      return res.status(404).json({ error: '삭제할 일정을 찾을 수 없습니다.' })
    }
    res.json({ deletedSchedule, message: '일정이 성공적으로 삭제되었습니다.' })
  } catch (err) {
    console.error('일정 삭제 에러', err)
    res.status(500).json({ error: '일정 삭제 실패' })
  }
})

export default router
