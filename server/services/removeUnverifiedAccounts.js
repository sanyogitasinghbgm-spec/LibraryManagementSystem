import cron from "node-cron";
import { User } from "../models/User.js";

// ── Runs every hour ──
cron.schedule("0 * * * *", async () => {
  console.log("🧹 Checking for unverified accounts...");

  try {
    // Delete accounts older than 1 hour that are still unverified
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await User.deleteMany({
      isVerified: false,
      createdAt: { $lt: oneHourAgo },
    });

    if (result.deletedCount > 0) {
      console.log(`🗑️ Removed ${result.deletedCount} unverified account(s).`);
    }
  } catch (error) {
    console.error("Remove unverified accounts cron error:", error.message);
  }
});
