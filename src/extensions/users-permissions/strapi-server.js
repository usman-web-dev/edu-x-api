const { get, merge } = require("lodash");
const {
  errors: { ApplicationError, ValidationError },
} = require("@strapi/utils");

module.exports = (plugin) => {
  const sanitizeUser = (user, addInAttributes = true) => {
    const {
      id,
      password,
      resetPasswordToken,
      confirmationToken,
      ...sanitizedUser
    } = user;

    return {
      id,
      ...(addInAttributes ? { attributes: sanitizedUser } : sanitizedUser),
    };
  };

  const uid = "plugin::users-permissions.user";

  const checkUserEmail = (email, id) => {
    return new Promise(async (res, rej) => {
      const users = await strapi.entityService.findMany(uid, {
        filters: { email: { $eq: email } },
        limit: 1,
      });

      if ((!id && users.length) || (id && users?.[0]?.id !== id)) {
        rej();
      } else {
        res();
      }
    });
  };

  plugin.controllers.user.findOne = async (ctx) => {
    const data = await strapi.entityService.findOne(
      uid,
      ctx.params.id,
      merge(ctx.query, {
        filters: { institute: { id: { $eq: ctx.state.user.institute.id } } },
      })
    );

    ctx.body = { data: sanitizeUser(data), meta: {} };
  };

  plugin.controllers.user.find = async (ctx) => {
    const data = await strapi.entityService.findPage(
      uid,
      merge(ctx.query, {
        filters: { institute: { id: { $eq: ctx.state.user.institute.id } } },
      })
    );

    data.results = data.results.map((user) => sanitizeUser(user));

    ctx.body = { data: data.results, meta: { pagination: data.pagination } };
  };

  plugin.controllers.user.create = async (ctx) => {
    const { data: userData } = ctx.request.body;

    try {
      await checkUserEmail(userData.email);
    } catch {
      return ctx.conflict(`"${userData.email}" is already taken.`);
    }

    userData.institute = { id: ctx.state.user.institute.id };

    const data = await strapi.entityService.create(uid, { data: userData });

    await strapi.plugins[
      "users-permissions"
    ].services.user.sendConfirmationEmail(data);

    ctx.body = { data: sanitizeUser(data), meta: {} };
  };

  plugin.controllers.user.update = async (ctx) => {
    const { data: userData } = ctx.request.body;

    try {
      await checkUserEmail(userData.email, userData.id);
    } catch {
      return ctx.conflict(`"${userData.email}" is already taken.`);
    }

    const data = await strapi.entityService.update(uid, ctx.params.id, {
      data: userData,
    });

    ctx.body = { data: sanitizeUser(data), meta: {} };
  };

  plugin.controllers.user.me = async (ctx) => {
    const data = await strapi.entityService.findOne(uid, ctx.state.user.id, {
      populate: ["role", "institute"],
    });

    ctx.body = sanitizeUser(data, false);
  };

  plugin.controllers.auth.callback = async (ctx) => {
    const getService = (name) => {
      return strapi.plugin("users-permissions").service(name);
    };

    const emailRegExp =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    const provider = ctx.params.provider || "local";
    const params = ctx.request.body;

    const store = await strapi.store({
      type: "plugin",
      name: "users-permissions",
    });

    const query = { provider };

    // Check if the provided identifier is an email or not.
    const isEmail = emailRegExp.test(params.identifier);

    // Set the identifier to the appropriate query field.
    if (isEmail) {
      query.email = params.identifier.toLowerCase();
    } else {
      query.username = params.identifier;
    }

    // Check if the user exists.
    const user = await strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: query, populate: ["role", "institute"] });

    if (!user) {
      throw new ValidationError("Invalid identifier or password");
    }

    if (
      get(await store.get({ key: "advanced" }), "email_confirmation") &&
      user.confirmed !== true
    ) {
      throw new ApplicationError("Your account email is not confirmed.");
    }

    if (user.blocked === true) {
      throw new ApplicationError(
        "Your account has been blocked by an administrator."
      );
    }

    // The user never authenticated with the `local` provider.
    if (!user.password) {
      throw new ApplicationError(
        "This user never set a local password, please login with the provider used during account creation"
      );
    }

    const validPassword = await getService("user").validatePassword(
      params.password,
      user.password
    );

    if (!validPassword) {
      throw new ValidationError("Invalid identifier or password");
    } else {
      ctx.send({
        jwt: getService("jwt").issue({
          id: user.id,
        }),
        user: await sanitizeUser(user, false),
      });
    }
  };

  const oldUserServices = plugin.services.user;

  plugin.services.user = (ctx) => ({
    ...oldUserServices(ctx),
    async fetchAuthenticatedUser(id) {
      return strapi
        .query(uid)
        .findOne({ where: { id }, populate: ["role", "institute"] });
    },
  });

  return plugin;
};
