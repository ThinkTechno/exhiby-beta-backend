import Location from "../models/locationModel.js"
import { generateSlotsForLocation } from "../utils/slotGenerator.js"

// CREATE LOCATION
const createLocation = async (req, res) => {
  try {
    const { name, city, state } = req.body;

    if (!name || !city || !state) {
      return res.status(400).json({
        success: false,
        message: "name, city, and state are required",
      });
    }

    const existing = await Location.findOne({ name, city });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Location already exists in this city",
      });
    }

    // Create location
    const newLocation = await Location.create({
      name,
      city,
      state,
    });

    // Generate slots for this location (for next 6 months)
    await generateSlotsForLocation(newLocation._id);

    return res.status(201).json({
      success: true,
      message: "Location created successfully",
      location: newLocation,
    });
  } catch (error) {
    console.error("Error creating location:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while creating location" });
  }
};

// GET LOCATION BY CITY
const getLocationByCity = async(req, res) => {
    try {
        const { city } = req.params
        const locations = await Location.find({ city }).select("_id name")
        
        if (locations.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No locations found"
            })
        }
        
        return res.status(200).json({
            success: true,
            locations: locations.map(location => ({
                locationId: location._id,
                locationName: location.name
            }))
        })
    } catch (error) {
        console.error("Cannot getLocationByCity:", error)
        return res.status(500).json({ success: false, message: "Server error in searching location" })
    }
}

export { createLocation, getLocationByCity }





// GET LOCATION BY STATE
// const getLocationByState = async(req, res) => {
//     try {
//         const { state } = req.params
//         const locations = await Location.find({ state }).select("_id name")
        
//         if (locations.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No locations found"
//             })
//         }

//         return res.status(200).json({
//             success: true,
//             locations: locations.map(location => ({
//                 locationId: location._id,
//                 locationName: location.name
//             }))
//         })
//     } catch (error) {
//         console.error("Cannot getLocationByState:", error)
//         return res.status(500).json({ success: false, message: "Server error in searching location" })
//     }
// }