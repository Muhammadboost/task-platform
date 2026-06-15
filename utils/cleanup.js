const cron = require('node-cron')
const cloudinary = require('../config/cloudinary')
const Submission = require('../models/Submission')

const startCleanup = () => {
  cron.schedule('0 2 * * 0', async () => {
    console.log('🧹 Starting weekly image cleanup...')
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const oldSubmissions = await Submission.find({
        createdAt: { $lt: sevenDaysAgo },
        proofFiles: { $exists: true, $ne: [] }
      })
      let deleted = 0
      for (const sub of oldSubmissions) {
        for (const url of sub.proofFiles) {
          try {
            const parts = url.split('/')
            const filename = parts[parts.length - 1].split('.')[0]
            const publicId = `task-proofs/${filename}`
            await cloudinary.uploader.destroy(publicId)
            deleted++
          } catch (e) {
            console.log('Could not delete:', url)
          }
        }
        await Submission.findByIdAndUpdate(sub._id, { proofFiles: [] })
      }
      console.log(`✅ Cleanup done! Deleted ${deleted} images from ${oldSubmissions.length} submissions.`)
    } catch (err) {
      console.error('Cleanup error:', err.message)
    }
  })
  console.log('🕐 Weekly cleanup scheduled — runs every Sunday at 2am')
}

module.exports = startCleanup
