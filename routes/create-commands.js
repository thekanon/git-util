const express = require("express");
const { getBranchNames } = require("../utils/git");
const { generateAllBranchCommands } = require("../utils/branchCommands");

const router = express.Router();

/**
 * 브랜치 생성 명령어 문자열 생성
 * POST /api/create-commands
 */
router.post("/", (req, res) => {
  const { ticket, work, employee } = req.body;
  if (!ticket || !work || !employee) {
    return res.status(400).json({ error: "ticket, work, employee 필수" });
  }

  const { repoPath, baseBranches } = req.app.locals.config;
  const { baseBranch, qaBranch, devBranch } = getBranchNames(
    ticket,
    work,
    employee
  );

  const commands = generateAllBranchCommands({
    repoPath,
    baseBranches,
    baseBranch,
    qaBranch,
    devBranch,
  });

  res.json({ ok: true, commands });
});

module.exports = router;

