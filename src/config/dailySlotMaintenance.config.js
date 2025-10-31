import cron from "node-cron";
import Location from "../models/locationModel.js";
import { generateSlotsForLocation } from "../utils/slotGenerator.js";

// Runs every night at 12:10 AM
cron.schedule("10 0 * * *", async () => {
  try {
    const locations = await Location.find();
    for (const loc of locations) {
      await generateSlotsForLocation(loc._id, "daily");
    }
    console.log("🌙 Daily slot maintenance completed.");
  } catch (err) {
    console.error("Error in daily slot cron:", err);
  }
});