import Screen from "../models/screenModel.js";

const createScreen = async (req, res) => {
  try {
    const { locationId, screenAddress, screenType, screenDimension, screenResolution } = req.body;

    if (!locationId || !screenAddress || !screenType) {
      return res.status(400).json({
        success: false,
        message: "locationId, screenAddress, and screenType are required",
      });
    }

    const location = await Location.findById(locationId);
    if (!location) {
      return res
        .status(404)
        .json({ success: false, message: "Location not found" });
    }

    const screen = await Screen.create({
      locationId,
      screenAddress,
      screenType,
      screenDimension,
      screenResolution,
    });

    return res.status(201).json({
      success: true,
      message: "Screen created successfully",
      screen,
    });
  } catch (error) {
    console.error("Error creating screen:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error while creating screen" });
  }
};

const getScreensByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;
    const screens = await Screen.find({ locationId }).select("_id screenAddress screenType");

    if (!screens.length) {
      return res.status(404).json({
        success: false,
        message: "No screens found for this location",
      });
    }

    return res.status(200).json({
      success: true,
      screens,
    });
  } catch (error) {
    console.error("Error fetching screens:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error fetching screens" });
  }
};

export { createScreen, getScreensByLocation };