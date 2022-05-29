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
      const { data, meta } = await super.find(ctx);

      const {
        student: { id },
        assessment: { type, subType },
        obtainedMarks,
      } = ctx.request.body.data;

      if (obtainedMarks != null && ctx.state.user.role === 4) {
        throw new UnauthorizedError(
          "You are not allowed to mark the assessment."
        );
      }

      await strapi.entityService.create("api::notification.notification", {
        data: {
          users: [id],
          text: `${ctx.state.user.username} has marked your assessment (${type}-${subType})`,
        },
      });

      return { data, meta };
    },
  })
);
