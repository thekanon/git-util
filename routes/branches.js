const express = require("express");
const { runCommand, extractErrorMessage } = require("../utils/git");

const router = express.Router();

/**
 * 로컬 브랜치 목록 조회 (최근 커밋 날짜 순)
 * GET /api/branches
 */
router.get("/", async (req, res) => {
  try {
    const { repoPath } = req.app.locals.config;
    // committerdate 기준 최신순 정렬, 탭으로 구분
    const cmd =
      "git for-each-ref --sort=-committerdate --format=%(committerdate:iso8601)%09%(refname:short) refs/heads/";
    const { stdout } = await runCommand(cmd, repoPath);

    const branches = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [date, name] = line.split("\t");
        return { date, name };
      });

    res.json({ ok: true, branches });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: extractErrorMessage(error, "브랜치 목록 조회 실패"),
    });
  }
});

module.exports = router;

