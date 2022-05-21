"use strict";
const { merge } = require("lodash");

/**
 *  grade controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::grade.grade", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
        institute: { id: { $eq: ctx.state.user.institute.id } },
      },
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
  async create(ctx) {
    ctx.request.body.data.institute = { id: ctx.state.user.institute.id };
    return super.create(ctx);
  },
}));
