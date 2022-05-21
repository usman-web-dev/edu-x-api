"use strict";
const { merge } = require("lodash");

/**
 *  department controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::department.department", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
        grade: { institute: { id: { $eq: ctx.state.user.institute.id } } },
      },
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
