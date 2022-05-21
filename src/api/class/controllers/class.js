"use strict";
const { merge } = require("lodash");

/**
 *  class controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::class.class", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
        batch: {
          department: {
            grade: { institute: { id: { $eq: ctx.state.user.institute.id } } },
          },
        },
      },
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
