"use strict";
const { merge } = require("lodash");

/**
 *  grade controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::grade.grade", () => ({
  async find(ctx) {
    console.log(ctx.state.user);
    ctx.query = merge(ctx.query, {
      filters: {
        institute: { id: { $eq: 1 } },
      },
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
