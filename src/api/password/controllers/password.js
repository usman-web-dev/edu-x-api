"use strict";
const { hash } = require("bcryptjs");
const uid = "plugin::users-permissions.user";
const {
  errors: { ValidationError, UnauthorizedError },
} = require("@strapi/utils");

/**
 *  institute controller
 */

module.exports = {
  async update(ctx) {
    const { id } = ctx.state.user;
    const { oldPassword, password } = ctx.request.body;

    if (!oldPassword || !password) {
      throw new ValidationError("Old Password or Password can't be empty.");
    }

    let user = await strapi.query(uid).findOne({ id });

    const validPassword = await strapi
      .service(uid)
      .validatePassword(oldPassword, user.password);

    if (!validPassword) {
      throw new UnauthorizedError("Current Password is wrong.");
    } else {
      const newPassword = await hash(password, 10);

      user = await strapi.query(uid).update({
        where: { id: user.id },
        data: { resetPasswordToken: null, password: newPassword },
      });

      ctx.send({
        updated: true,
      });
    }
  },
};
