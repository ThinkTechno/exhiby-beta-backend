import Slot from "../models/slotModel.js";

/**
 * Atomically adds an ad to a slot if there are < 5 ads already.
 * Returns the updated slot if success, or null if slot full/unavailable.
 */
export const bookSlot = async (slotId, adId) => {
  const updatedSlot = await Slot.findOneAndUpdate(
    {
      _id: slotId,
      isAvailable: true,
      $expr: { $lt: [{ $size: "$bookedAds" }, 5] } // check length < 5
    },
    {
      $push: { bookedAds: adId },
      $set: {
        // If this makes it full, mark unavailable
        isAvailable: { $cond: [{ $eq: [{ $size: "$bookedAds" }, 4] }, false, true] }
      }
    },
    { new: true }
  );

  return updatedSlot; // will be null if condition failed
};
