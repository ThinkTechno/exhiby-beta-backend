import PersonalProfile from "../models/personalProfileModel.js"
import BusinessProfile from "../models/businessProfileModel.js"
import uploadOnCloudinary from "../utils/uploadMedia.js"

// PERSONAL PROFILE REGISTRATION HANDLER
const createPersonalProfile = async (req, res) => {
  try {
    const { userId, tokenType } = req.user
    if (!userId || tokenType !== "access") {
      return res.status(401).json({ success: false, message: "Unauthorized request" })
    }

    // Check existing profile
    const existing = await PersonalProfile.findOne({ userId })
    if (existing) {
      return res.status(400).json({ success: false, message: "Personal profile already exists" })
    }

    const govIdFilePath = req.files?.govIdFile?.[0]?.path
    const selfieFilePath = req.files?.selfieWithIdFile?.[0]?.path

    if (!govIdFilePath || !selfieFilePath) {
      return res.status(400).json({ success: false, message: "Both files are required" })
    }

    // Upload to Cloudinary
    const govUpload = await uploadOnCloudinary(govIdFilePath)
    const selfieUpload = await uploadOnCloudinary(selfieFilePath)

    const newProfile = new PersonalProfile({
      userId,
      govIdFileUri: govUpload.mediaUri,
      selfieWithIdFileUri: selfieUpload.mediaUri
    })

    await newProfile.save()

    return res.status(201).json({
      success: true,
      message: "Personal profile created successfully. Verification pending."
    })
  } catch (error) {
    console.error("Create Personal Profile Error:", error)
    return res.status(500).json({ success: false, message: "Server error: cannot create personal profile" })
  }
}

// PERSONAL PROFILE REUPLOAD HANDLER
const reuploadPersonalProfile = async (req, res) => {
  try {
    const { userId, tokenType } = req.user
    if (!userId || tokenType !== "access") {
      return res.status(401).json({ message: "Unauthorized request" })
    }

    const profile = await PersonalProfile.findOne({ userId })
    if (!profile) {
      return res.status(404).json({ message: "Personal profile not found" })
    }

    const govIdFilePath = req.files?.govIdFile?.[0]?.path
    const selfieFilePath = req.files?.selfieWithIdFile?.[0]?.path

    if (govIdFilePath) {
      const govUpload = await uploadOnCloudinary(govIdFilePath)
      profile.govIdFileUri = govUpload.mediaUri
    }

    if (selfieFilePath) {
      const selfieUpload = await uploadOnCloudinary(selfieFilePath)
      profile.selfieWithIdFileUri = selfieUpload.mediaUri
    }

    await profile.save()

    return res.status(200).json({ message: "Personal profile reuploaded successfully" })
  } catch (error) {
    console.error("Reupload Personal Profile Error:", error)
    return res.status(500).json({ message: "Server error: cannot reupload personal profile" })
  }
}

//------------------------------------------------------------------

// BUSINESS PROFILE REGISTRATION HANDLER
const createBusinessProfile = async (req, res) => {
  try {
    const { userId, tokenType } = req.user
    if (!userId || tokenType !== "access") {
      return res.status(401).json({ success: false, message: "Unauthorized request" })
    }
    
    const { businessName, businessEmail, website, registrationNumber, businessType, industryType } = req.body.data ? JSON.parse(req.body.data) : {}
    
    if (!businessName || !businessEmail || !registrationNumber || !businessType || !industryType) {
      return res.status(400).json({ success: false, message: "All fields are required" })
    }
    
    const existing = await BusinessProfile.findOne({ $or: [{ userId }, { businessEmail }] })
    if (existing) {
      return res.status(400).json({ success: false, message: "Business profile already exists" })
    }
    
    const letterheadFilePath = req.files?.letterheadFile?.[0]?.path
    if (!letterheadFilePath) {
      return res.status(400).json({ success: false, message: "Letterhead file is required" })
    }
    
    const letterheadUpload = await uploadOnCloudinary(letterheadFilePath)
    
    const newBusiness = new BusinessProfile({
      userId,
      businessName,
      businessEmail,
      website,
      registrationNumber,
      businessType,
      industryType,
      letterheadFileUri: letterheadUpload.mediaUri
    })
    
    const businessProfile = await newBusiness.save()
    
    return res.status(201).json({
      success: true,
      message: "Business profile created successfully. Verification pending",
      businessProfile
    })
  } catch (error) {
    console.error("Create Business Profile Error:", error)
    return res.status(500).json({ success: false, message: "Server error: cannot create business profile" })
  }
}

// BUSINESS PROFILE UPDATE HANDLER
const updateBusinessProfile = async (req, res) => {
  try {
    const { userId, tokenType } = req.user
    
    if (!userId || tokenType !== "access") {
      return res.status(401).json({ success: false, message: "Unauthorized request" })
    }
    
    const profile = await BusinessProfile.findOne({ userId })
    if (!profile) {
      return res.status(404).json({ success: false, message: "Business profile not found" })
    }
    
    const { businessName, businessEmail, website, registrationNumber, businessType, industryType } = req.body
    
    profile.businessName = businessName || profile.businessName
    profile.businessEmail = businessEmail || profile.businessEmail
    profile.website = website || profile.website
    profile.registrationNumber = registrationNumber || profile.registrationNumber
    profile.businessType = businessType || profile.businessType
    profile.industryType = industryType || profile.industryType
    
    const businessProfile = await profile.save()
    
    return res.status(200).json({ 
      success: true,
      message: "Business profile updated successfully",
      businessProfile
    })
  } catch (error) {
    console.error("Update Business Profile Error:", error)
    return res.status(500).json({ success: false, message: "Server error: cannot update business profile" })
  }
}


export { createPersonalProfile, reuploadPersonalProfile, createBusinessProfile, updateBusinessProfile }





// PERSONAL PROFILE REVIEW HANDLER
// const verifyPersonalProfile = async (req, res) => {
//   try {
//     const { adminId, userId, tokenType } = req.user

//     if (!adminId || tokenType !== "access") {
//       return res.status(401).json({ message: "Unauthorized request" })
//     }

//     if (!userId) {
//       return res.status(400).json({ message: "userId required" })
//     }

//     const profile = await PersonalProfile.findOne({ userId })
//     if (!profile) {
//       return res.status(404).json({ message: "Personal profile not found" })
//     }

//     profile.reviewStatus = 
//     await profile.save()

//     return res.status(200).json({ message: "Personal profile verified successfully" })
//   } catch (error) {
//     console.error("Verify Personal Profile Error:", error)
//     return res.status(500).json({ message: "Server error: cannot verify personal profile" })
//   }
// }