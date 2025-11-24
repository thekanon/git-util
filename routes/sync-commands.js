const express = require("express");
const { getBranchNames, extractErrorMessage } = require("../utils/git");
const { generateAllSyncCommands } = require("../utils/syncCommands");

const router = express.Router();

/**
 * Sync 명령어 생성
 * POST /api/sync-commands
 */
router.post("/", async (req, res) => {
  const { ticket, work, employee, targets } = req.body;

  if (!ticket || !work || !employee) {
    return res.status(400).json({ error: "ticket, work, employee 필수" });
  }
  if (!targets || (!targets.dev && !targets.qa)) {
    return res.status(400).json({ error: "dev 또는 qa가 필요합니다" });
  }

  const { repoPath } = req.app.locals.config;
  const { baseBranch, qaBranch, devBranch } = getBranchNames(
    ticket,
    work,
    employee
  );

  try {
    const commands = await generateAllSyncCommands({
      repoPath,
      baseBranch,
      qaBranch,
      devBranch,
      targets,
    });

    res.json({ ok: true, commands });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: extractErrorMessage(error, "알 수 없는 오류"),
    });
  }
});

module.exports = router;

