import TimelineEvent from "../models/TimelineEvent.js";
import Notification from "../models/Notification.js";

async function addTimeline({ entityType, entityId, action, message, metadata, actor }) {
  return TimelineEvent.create({
    entityType,
    entityId,
    action,
    message,
    metadata,
    actor,
  });
}

async function notify({ user, title, message, type, link }) {
  if (!user) return null;
  return Notification.create({ user, title, message, type, link });
}

export { addTimeline, notify };
