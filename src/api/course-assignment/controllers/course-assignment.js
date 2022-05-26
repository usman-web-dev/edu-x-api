"use strict";
const { merge } = require("lodash");

/**
 *  course-assignment controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController(
  "api::course-assignment.course-assignment",
  () => ({
    async find(ctx) {
      ctx.query = merge(ctx.query, {
        filters: {
          section: {
            class: {
              batch: {
                department: {
                  grade: {
                    institute: { id: { $eq: ctx.state.user.institute.id } },
                  },
                },
              },
            },
          },
        },
      });

      const { data, meta } = await super.find(ctx);
      return { data, meta };
    },
  })
);
