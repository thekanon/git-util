require("dotenv").config();

const config = {
  port: process.env.PORT || 53000,
  repoPath: process.env.GIT_REPO_PATH || ".",
  baseBranches: {
    preStage: "pre-stage",
    qaStage: "qa-stage",
    develop: "develop",
  },
};

module.exports = config;

