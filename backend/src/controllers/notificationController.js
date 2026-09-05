import Notification from "../models/Notification.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { markOverdueActivities } from "../services/activities.js";

const listNotifications = asyncHandler(async (req, res) => {
  await markOverdueActivities();
  const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
  const unread = await Notification.countDocuments({ user: req.user.id, read: false });
  res.json({ items, unread });
});

const markRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

const markOneRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { $set: { read: true } }
  );
  res.json({ ok: true });
});

export { listNotifications, markRead, markOneRead };
