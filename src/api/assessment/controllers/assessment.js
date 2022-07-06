"use strict";

/**
 *  assessment controller
 */

const sendNotification = async (ctx) => {
  const {
    id,
    type,
    subType,
    course: { id: courseAssignmentId },
  } = ctx.request.body.data;

  const courseAssignment = await strapi.entityService.findOne(
    "api::course-assignment.course-assignment",
    courseAssignmentId,
    {
      filters: {
        id: {
          $eq: courseAssignmentId,
        },
      },
      populate: ["students"],
    }
  );

  for (const { id: studentId } of courseAssignment.students) {
    const notification = await strapi.entityService.create(
      "api::notification.notification",
      {
        data: {
          user: studentId,
          text: `${ctx.state.user.username} has ${
            id ? "updated the" : "added an"
          } assessment (${type}-${subType})`,
          type: "assessment",
          extra: {
            courseAssignmentId,
          },
        },
      }
    );

    const socket = strapi.config.utils.CONNECTED_SOCKETS[studentId]?.socket;

    if (socket) {
      socket.emit("notification", notification);
    }
  }
};

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::assessment.assessment", () => ({
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
}));
