"use strict";
const { merge } = require("lodash");

/**
 *  attendance controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::attendance.attendance", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
        courseAssignment: {
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
      },
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
