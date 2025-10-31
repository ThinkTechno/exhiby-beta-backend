import Slot from "../models/slotModel.js";
import Location from "../models/locationModel.js";

/**
 * Generate slots for a given location
 * @param {String} locationId - Location ID
 * @param {"full"|"daily"} mode - Whether to generate 6 months of slots or just 1 new day
 */
export const generateSlotsForLocation = async (locationId, mode = "full") => {
  try {
    const location = await Location.findById(locationId);
    if (!location) {
      console.error("Location not found:", locationId);
      return;
    }

    // Clean up expired slots (before today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deletedSlots = await Slot.deleteMany({
      locationId,
      date: { $lt: today }
    });

    if (deletedSlots.deletedCount > 0) {
      console.log(`Deleted ${deletedSlots.deletedCount} expired slots for ${location.name}`);
    }

    // STEP 2: Determine date range
    let startDate = today;
    let endDate;

    if (mode === "full") {
      endDate = new Date();
      endDate.setMonth(today.getMonth() + 6);
    } else {
      // Daily mode → create only one new day (the next 6-month day)
      const latestSlot = await Slot.findOne({ locationId }).sort({ date: -1 });
      if (latestSlot) {
        startDate = new Date(latestSlot.date);
        startDate.setDate(startDate.getDate() + 1);
        endDate = new Date(startDate);
      } else {
        // No existing slots found — fallback to full generation
        endDate = new Date();
        endDate.setMonth(today.getMonth() + 6);
      }
    }

    const slotsToCreate = [];

    // Example slot windows (customize freely)
    const timeWindows = [
      { window: "09-10", shift: "standard", price: 300 },
      { window: "10-11", shift: "standard", price: 300 },
      { window: "11-12", shift: "standard", price: 300 },
      { window: "12-13", shift: "prime", price: 500 },
      { window: "13-14", shift: "prime", price: 500 },
      { window: "14-15", shift: "prime", price: 500 },
      { window: "15-16", shift: "standard", price: 300 },
      { window: "16-17", shift: "standard", price: 300 }
    ];

    // Generate slots for each date
    let date = new Date(startDate);
    while (date <= endDate) {
      const day = new Date(date);
      timeWindows.forEach((slotConfig) => {
        slotsToCreate.push({
          locationId,
          date: day,
          window: slotConfig.window,
          shift: slotConfig.shift,
          price: slotConfig.price,
          bookedAds: [],
          isAvailable: true
        });
      });
      date.setDate(date.getDate() + 1);
    }

    if (slotsToCreate.length === 0) {
      console.log(`No new slots needed for ${location.name}`);
      return;
    }

    // STEP 4: Insert new slots in bulk
    const createdSlots = await Slot.insertMany(slotsToCreate, { ordered: false });

    // STEP 5: Update location with new slot IDs
    const slotIds = createdSlots.map((s) => s._id);
    await Location.findByIdAndUpdate(locationId, {
      $addToSet: { slots: { $each: slotIds } }
    });

    console.log(
      `${createdSlots.length} slots (${mode}) created for location: ${location.name}`
    );
  } catch (error) {
    console.error("Error generating slots for location:", error);
  }
};







// export const generateSlotsForLocation = async (locationId) => {
//   const location = await Location.findById(locationId);
//   if (!location) throw new Error("Location not found");

//   const today = new Date();
//   const sixMonthsLater = new Date(today);
//   sixMonthsLater.setMonth(today.getMonth() + 6);

//   const timeWindows = [
//     { window: "09-10", shift: "standard", price: 100 },
//     { window: "10-11", shift: "standard", price: 120 },
//     { window: "11-12", shift: "prime", price: 150 },
//     // Add more windows
//   ];

//   const slots = [];
//   for (
//     let d = new Date(today);
//     d <= sixMonthsLater;
//     d.setDate(d.getDate() + 1)
//   ) {
//     for (const { window, shift, price } of timeWindows) {
//       const existing = await Slot.findOne({
//         locationId,
//         date: d,
//         window,
//       });
//       if (!existing) {
//         slots.push({
//           locationId,
//           date: new Date(d),
//           window,
//           shift,
//           price,
//         });
//       }
//     }
//   }

//   if (slots.length) {
//     await Slot.insertMany(slots);
//     console.log(`Created ${slots.length} slots for ${location.name}`);
//   }
// };
