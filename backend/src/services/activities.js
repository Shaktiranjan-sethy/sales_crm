import Activity from "../models/Activity.js";
import Notification from "../models/Notification.js";
import { notify } from "./events.js";

async function markOverdueActivities() {
  const now = new Date();
  const overdue = await Activity.find({
    status: "pending",
    dueAt: { $lt: now },
  }).limit(200);

  for (const activity of overdue) {
    activity.status = "overdue";
    await activity.save();
    const already = await Notification.findOne({
      user: activity.assignedTo,
      type: "overdue_followup",
      link: `/activities/${activity._id}`,
    });
    if (!already) {
      await notify({
        user: activity.assignedTo,
        title: "Overdue follow-up",
        message: `"${activity.title}" is overdue`,
        type: "overdue_followup",
        link: `/activities/${activity._id}`,
      });
    }
  }
}

export { markOverdueActivities };
