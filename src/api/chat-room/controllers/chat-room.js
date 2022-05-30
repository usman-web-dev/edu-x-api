"use strict";
const { merge } = require("lodash");

/**
 *  chat-room controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::chat-room.chat-room", () => ({
  async find(ctx) {
    ctx.query = merge(ctx.query, {
      filters: {
        course: {
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
