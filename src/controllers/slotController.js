import Slot from "../models/slotModel.js"

// GET SLOTS BY LOCATION ID
export const getAvailableSlots = async (req, res) => {
  try {
    const { locationId, startDate, endDate, shift = null } = req.query;

    if (!locationId) {
      return res.status(400).json({ success: false, message: "locationId is required" });
    }

    // Build query dynamically
    const query = {
      locationId,
      isAvailable: true,
    };

    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else {
      // Default to next 7 days if not specified
      const today = new Date();
      const defaultMinDuration = new Date();
      defaultMinDuration.setDate(today.getDate() + 15);
      query.date = { $gte: today, $lte: defaultMinDuration };
    }

    // Filter by shift (optional)
    // if (shift) query.shift = shift; // e.g. "prime" or "standard"

    const slots = await Slot.find(query)
      .sort({ date: 1, window: 1 })
      .select("-__v");

    res.status(200).json({
      success: true,
      count: slots.length,
      slots,
    });
  } catch (error) {
    console.error("Get Slots Error:", error);
    res.status(500).json({ success: false, message: "Server error fetching slots" });
  }
};
