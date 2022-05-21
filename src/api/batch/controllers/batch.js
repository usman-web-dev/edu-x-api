"use strict";
const { merge } = require("lodash");

/**
 *  batch controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::batch.batch", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
        department: { grade: { institute: { id: { $eq: 1 } } } },
      },
    });

    const { data, meta } = await super.find(ctx);
    return { data, meta };
  },
}));
