const express = require("express");
const { runCommand, getBranchNames, extractErrorMessage } = require("../utils/git");

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

  const output = [`# 작업 경로: ${repoPath}`, `# source: ${baseBranch}`, ``];

  /**
   * 특정 타겟 브랜치에 대한 sync 명령어 생성
   * @param {string} targetBranch - 타겟 브랜치명
   * @returns {Promise<string>}
   */
  async function generateSyncFor(targetBranch) {
    const diffCmd = `git log --reverse --cherry-pick --right-only --no-merges --format=%H ${targetBranch}...${baseBranch}`;

    let result;
    try {
      result = await runCommand(diffCmd, repoPath);
    } catch (error) {
      const msg = extractErrorMessage(
        error,
        `git log 실행 오류 (${targetBranch}...${baseBranch})`
      );
      return [`# ${targetBranch} sync 중 오류`, `# ${msg}`, ""].join("\n");
    }

    const hashes = result.stdout
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (hashes.length === 0) {
      return [`# ${targetBranch} → cherry-pick할 신규 커밋 없음`, ""].join("\n");
    }

    const lines = [];
    lines.push(`# ${targetBranch} sync`);
    lines.push(`git checkout ${targetBranch}`);

    hashes.forEach((hash) => {
      lines.push(`git cherry-pick ${hash}`);
    });

    lines.push(""); // 빈 줄

    return lines.join("\n");
  }

  try {
    if (targets.dev) {
      const txt = await generateSyncFor(devBranch);
      output.push(txt);
    }
    if (targets.qa) {
      const txt = await generateSyncFor(qaBranch);
      output.push(txt);
    }

    res.json({ ok: true, commands: output.join("\n") });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: extractErrorMessage(error, "알 수 없는 오류"),
    });
  }
});

module.exports = router;

