import cron from "node-cron";
import { BorrowRecord } from "../models/BorrowRecord.js";
import { sendEmail } from "../utils/sendEmail.js";

// ── Runs every day at 8:00 AM ──
cron.schedule("0 8 * * *", async () => {
  console.log("Running due date reminder cron job...");
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Books due tomorrow
    const dueSoonRecords = await BorrowRecord.find({
      status: "borrowed",
      dueDate: { $gte: tomorrow, $lt: dayAfter },
    })
      .populate("userId", "name email")
      .populate("bookId", "title");
    for (const record of dueSoonRecords) {
      await sendEmail({
        email: record.userId.email,
        subject: "📚 Library Reminder — Book Due Tomorrow!",
        message: `
          <h2>Hello ${record.userId.name}!</h2>
          <p>This is a reminder that the book <strong>"${record.bookId.title}"</strong> is due tomorrow — <strong>${record.dueDate.toDateString()}</strong>.</p>
          <p>Please return it on time to avoid a fine of <strong>Rs. 5 per day</strong>.</p>
          <p>Thank you! 📖</p>
        `,
      });
    }

    // Mark overdue records
    await BorrowRecord.updateMany(
      { status: "borrowed", dueDate: { $lt: new Date() } },
      { status: "overdue" }
    );
    console.log(`Sent ${dueSoonRecords.length} reminders.`);
  } catch (error) {
    console.error("Cron job error:", error.message);
  }
});
