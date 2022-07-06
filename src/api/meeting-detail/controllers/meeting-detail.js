"use strict";

const { format } = require("date-fns");

/**
 *  meeting-detail controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

const sendNotification = async (ctx) => {
  if (!ctx.request.body.data.meeting) {
    return;
  }

  const {
    data: {
      meeting: {
        id: meetingId,
        recurring,
        start,
        course: { id: courseAssignmentId },
      },
      attendee: { id },
    },
  } = ctx.request.body;

  const { username, id: userId } = ctx.state.user;

  if (id === userId) {
    return;
  }

  const notification = await strapi.entityService.create(
    "api::notification.notification",
    {
      data: {
        user: id,
        text: `${username} has scheduled a ${
          recurring ? "recurring " : ""
        }meeting on ${format(new Date(start), "do MMM, yyyy h:mm a")}`,
        extra: {
          meetingId,
          courseAssignmentId,
        },
        type: "meeting",
      },
    }
  );

  const socket = strapi.config.utils.CONNECTED_SOCKETS[id]?.socket;

  if (socket) {
    socket.emit("notification", notification);
  }
};

module.exports = createCoreController(
  "api::meeting-detail.meeting-detail",
  () => ({
    async create(ctx) {
      const { data, meta } = await super.create(ctx);
      await sendNotification(ctx);
      return { data, meta };
    },
    async update(ctx) {
      const { data, meta } = await super.update(ctx);
      await sendNotification(ctx);
      return { data, meta };
    },
  })
);
