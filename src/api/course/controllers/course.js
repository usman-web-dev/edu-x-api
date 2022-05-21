"use strict";

/**
 *  course controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::course.course", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
        department: {
          grade: { institute: { id: { $eq: ctx.state.user.institute.id } } },
        },
      },
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
