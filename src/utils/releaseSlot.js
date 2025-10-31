export const releaseSlot = async (slotId, adId) => {
  await Slot.findByIdAndUpdate(slotId, {
    $pull: { bookedAds: adId },
    $set: { isAvailable: true }
  });
};