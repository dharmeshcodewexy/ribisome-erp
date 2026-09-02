const { envs } = require("../services/environment.service");

module.exports = {
  development: envs.db,
  production: envs.db,
  test: envs.db,
};
