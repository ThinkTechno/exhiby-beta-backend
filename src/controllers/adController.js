import Ad from "../models/adModel.js"
import uploadOnCloudinary from "../utils/uploadMedia.js"

// Create Ad
const createAd = async (req, res) => {
  try {
    const { userId, tokenType } = req.user
    if (!userId || tokenType !== "access") {
      return res.status(401).json({ success: false, message: "Unauthorized request" })
    }

    const { name, adStartDate, adDuration, locations, slots } = req.body.data ? JSON.parse(req.body.data) : {}

    if (!name || !adStartDate || !adDuration || !locations || !slots) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }

    // Parse arrays if sent as JSON strings
    const parsedLocations = typeof locations === "string" ? JSON.parse(locations) : locations
    const parsedSlots = typeof slots === "string" ? JSON.parse(slots) : slots

    const adMediaPath = req.file?.path
    if (!adMediaPath) {
      return res.status(400).json({ success: false, message: "Ad media file is required" })
    }

    const { mediaUri, mediaType, mediaDuration = null } = await uploadOnCloudinary(adMediaPath)

    const statusHistory = [
      { status: "under_review", time: new Date() }
    ]

    const newAd = new Ad({
      userId,
      name,
      adMediaUri: mediaUri,
      adMediaType: mediaType,
      adMediaDuration: mediaDuration,
      adStartDate,
      adDuration,
      locations: parsedLocations,
      slots: parsedSlots,
      statusHistory
    })

    await newAd.save()

    return res.status(201).json({
      success: true,
      message: "Ad created successfully and submitted for review"
    })

  } catch (error) {
    console.error("Create Ad Error:", error)
    return res.status(500).json({ success: false, message: "Server error: cannot create ad" })
  }
}

// Reupload Ad
const reuploadAd = async (req, res) => {
  try {
    const { adId } = req.params
    const { userId, tokenType } = req.user

    if (!userId || tokenType !== "access") {
      return res.status(401).json({ success: false, message: "Unauthorized request" })
    }

    const ad = await Ad.findOne({ _id: adId, userId })
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" })
    }

    if (ad.status !== "rejected") {
      return res.status(400).json({ success: false, message: "Only rejected ads can be reuploaded" })
    }

    const adMediaPath = req.file?.path
    if (!adMediaPath) {
      return res.status(400).json({ success: false, message: "Ad media file is required" })
    }

    const { mediaUri, mediaType, mediaDuration = null } = await uploadOnCloudinary(adMediaPath)

    ad.adMediaUri = mediaUri
    ad.adMediaType = mediaType
    ad.adMediaDuration = mediaDuration
    ad.status = "reuploaded"
    ad.rejectionReason = null
    ad.statusHistory.push({ status: "reuploaded", time: new Date() })

    await ad.save()

    return res.status(200).json({ success: true, message: "Ad reuploaded successfully and is under review again" })

  } catch (error) {
    console.error("Reupload Ad Error:", error)
    return res.status(500).json({ success: false, message: "Server error: cannot reupload ad" })
  }
}

// Get Ad Info
const getAdInfo = async (req, res) => {
  try {
    const { adId } = req.params
    const { userId, tokenType } = req.user

    if (!userId || tokenType !== "access") {
      return res.status(401).json({ success: false, message: "Unauthorized request" })
    }

    const ad = await Ad.findOne({ _id: adId, userId })
    if (!ad) {
      return res.status(404).json({ success: false, message: "Ad not found" })
    }

    return res.status(200).json({success: true, ad})

  } catch (error) {
    console.error("Get Ad Info Error:", error)
    return res.status(500).json({ success: false, message: "Server error: cannot get ad info" })
  }
}

export { createAd, reuploadAd, getAdInfo }