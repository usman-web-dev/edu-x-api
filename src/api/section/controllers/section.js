"use strict";
const { merge } = require("lodash");

/**
 *  section controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::section.section", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
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
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
