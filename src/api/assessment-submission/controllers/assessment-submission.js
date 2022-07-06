"use strict";
const {
  errors: { UnauthorizedError },
} = require("@strapi/utils");

/**
 *  assessment-submission controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::assessment-submission.assessment-submission",
  () => ({
    async update(ctx) {
      const {
        student: { id },
        assessment: {
          id: assessmentId,
          type,
          subType,
          course: { id: courseAssignmentId },
        },
        obtainedMarks,
      } = ctx.request.body.data;

      if (obtainedMarks != null && ctx.state.user.role === 4) {
        throw new UnauthorizedError(
          "You are not allowed to mark the assessment."
        );
      }

      const { data, meta } = await super.update(ctx);

      const notification = await strapi.entityService.create(
        "api::notification.notification",
        {
          data: {
            user: id,
            text: `${ctx.state.user.username} has marked your assessment (${type}-${subType})`,
            type: "marks",
            extra: {
              courseAssignmentId,
              assessmentId,
            },
          },
        }
      );

      const socket = strapi.config.utils.CONNECTED_SOCKETS[id]?.socket;

      if (socket) {
        socket.emit("notification", notification);
      }

      return { data, meta };
    },
  })
);
