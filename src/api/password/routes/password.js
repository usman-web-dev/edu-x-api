"use strict";

/**
 * password router.
 */

module.exports = {
  type: "password",
  routes: [
    {
      method: "PATCH",
      path: "/auth/update-password",
      handler: "password.update",
    },
  ],
};
