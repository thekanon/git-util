const express = require("express");
const { getBranchNames } = require("../utils/git");

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

  const cmds = [];
  cmds.push(`# 작업 경로: ${repoPath}`);

  // pre-stage 기반 feature 브랜치 생성
  cmds.push(`# pre-stage 기반 feature 브랜치 생성`);
  cmds.push(`git checkout ${baseBranches.preStage}`);
  cmds.push(`git pull`);
  cmds.push(`git checkout -b ${baseBranch}`);
  cmds.push(`git push --set-upstream origin ${baseBranch}\n`);

  // qa-stage 기반 feature 브랜치 생성
  cmds.push(`# qa-stage 기반 feature 브랜치 생성`);
  cmds.push(`git checkout ${baseBranches.qaStage}`);
  cmds.push(`git pull`);
  cmds.push(`git checkout -b ${qaBranch}`);
  cmds.push(`git push --set-upstream origin ${qaBranch}\n`);

  // develop 기반 feature 브랜치 생성
  cmds.push(`# develop 기반 feature 브랜치 생성`);
  cmds.push(`git checkout ${baseBranches.develop}`);
  cmds.push(`git pull`);
  cmds.push(`git checkout -b ${devBranch}`);
  cmds.push(`git push --set-upstream origin ${devBranch}\n`);

  cmds.push(`git checkout ${baseBranch}`);
  cmds.push(`git branch`);

  res.json({ ok: true, commands: cmds.join("\n") });
});

module.exports = router;

