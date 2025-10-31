import crypto from "crypto"
import Ad from "../models/adModel.js";
import Booking from "../models/bookingModel.js"
import { getChargesAndTaxes } from "../utils/constant.js"
import { bookSlot } from "../utils/bookSlot.js"
import { releaseSlot } from "../utils/releaseSlot.js"
import razorpay from "../config/razorpay.config.js"

// CREATE BOOKING (Generate Razorpay Order)
const createBooking = async (req, res) => {
  try {
    const { adId, offerId } = req.body;
    const { userId, tokenType } = req.user;

    if (!userId || tokenType !== "access") {
      return res.status(401).json({ success: false, message: "Unauthorized request" });
    }

    if (!adId ) {
      return res.status(400).json({ success: false, message: "Missing required booking fields" });
    }

    const ad = await Ad.findById(adId);
    if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });

    let totalCostOfSlots = 0;
    const failedSlots = [];
    const bookedSlots = [];

    // Try to lock each slot safely
    for (const slotId of ad.slots) {
      const updatedSlot = await bookSlot(slotId, ad._id);
      if (!updatedSlot) {
        failedSlots.push(slotId);
      } else {
        bookedSlots.push(updatedSlot);
        totalCostOfSlots += updatedSlot.price;
      }
    }

    if (failedSlots.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some slots are already full or unavailable",
        failedSlots
      });
    }

    const { charge, tax } = {...getChargesAndTaxes}
    const totalAmount = totalCostOfSlots + charge + tax


    // Razorpay order creation
    const options = {
      amount: totalAmount * 100, // amount in paisa
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // Store in DB
    const newBooking = new Booking({
      userId,
      adId,
      totalCostOfSlots,
      charges: charge,
      taxes: tax,
      totalAmount,
      offerId,
      orderRefId: order.id,
    });

    await newBooking.save();

    return res.status(201).json({
      success: true,
      message: "Booking initiated successfully",
      key: process.env.RAZORPAY_KEY_ID,
      order,
    })
  } catch (error) {
    console.error("Create Booking Error:", error);
    return res.status(500).json({ success: false, message: "Error! Booking creation failed" });
  }
};

// VERIFY PAYMENT SIGNATURE
const verifyBooking = async (req, res) => {
  try {
    const { orderRefId, paymentRefId, signature } = req.body;

    if (!orderRefId || !paymentRefId || !signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification fields" });
    }

    // Generate expected signature
    const sign = `${orderRefId}|${paymentRefId}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    const isValid = expectedSign === signature;

    if (isValid) {
      await Booking.findOneAndUpdate(
        { orderRefId },
        { paymentRefId, paymentStatus: "success" },
        { new: true }
      );
      return res.status(200).json({ success: true, message: "Payment verified successfully" });
    } else {
      await Booking.findOneAndUpdate(
        { orderRefId },
        { paymentStatus: "failed" },
        { new: true }
      );

      // Release all booked slots for this ad
      const booking = await Booking.findOne({ orderRefId }).populate("adId");
      for (const slotId of booking.adId.slots) {
        await releaseSlot(slotId, booking.adId._id);
  }

      return res.status(400).json({ success: false, message: "Invalid signature. Payment not verified" });
    }
  } catch (error) {
    console.error("Verify Booking Error:", error);
    return res.status(500).json({ success: false, message: "Error! Booking verification failed" });
  }
};

export { createBooking, verifyBooking };





// --------------------------- Web Hook Integration (Later) -----------------------------

// router.post("/webhook", express.json({ type: "application/json" }), async (req, res) => {
//   const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
//   const signature = req.headers["x-razorpay-signature"];
//   const body = JSON.stringify(req.body);

//   const expectedSignature = crypto
//     .createHmac("sha256", webhookSecret)
//     .update(body)
//     .digest("hex");

//   if (signature !== expectedSignature) {
//     return res.status(400).json({ success: false, message: "Invalid webhook signature" });
//   }

//   const event = req.body.event;
//   const payment = req.body.payload?.payment?.entity;

//   if (event === "payment.captured") {
//     await Booking.findOneAndUpdate(
//       { orderRefId: payment.order_id },
//       {
//         paymentRefId: payment.id,
//         paymentStatus: "success",
//       },
//       { new: true }
//     );
//   } else if (event === "payment.failed") {
//     await Booking.findOneAndUpdate(
//       { orderRefId: payment.order_id },
//       { paymentStatus: "failed" }
//     );
//   }

//   res.status(200).json({ success: true });
// });