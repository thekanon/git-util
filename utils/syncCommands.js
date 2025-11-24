const { runCommand, extractErrorMessage } = require("./git");

/**
 * Sync 명령어 생성 유틸리티
 */

/**
 * 특정 타겟 브랜치에 대한 sync 명령어 생성
 * @param {Object} params - Sync 파라미터
 * @param {string} params.targetBranch - 타겟 브랜치명
 * @param {string} params.baseBranch - base 브랜치명
 * @param {string} params.repoPath - 작업 경로
 * @returns {Promise<string>} 생성된 명령어 문자열
 */
async function generateSyncFor({ targetBranch, baseBranch, repoPath }) {
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
    return [`# ${targetBranch} → cherry-pick할 신규 커밋 없음`, ""].join(
      "\n"
    );
  }

  const lines = [`# ${targetBranch} sync`, `git checkout ${targetBranch}`];

  hashes.forEach((hash) => {
    lines.push(`git cherry-pick ${hash}`);
  });

  lines.push(""); // 빈 줄

  return lines.join("\n");
}

/**
 * 모든 sync 명령어 생성
 * @param {Object} params - Sync 파라미터
 * @param {string} params.repoPath - 작업 경로
 * @param {string} params.baseBranch - base 브랜치명
 * @param {string} params.qaBranch - QA 브랜치명
 * @param {string} params.devBranch - Develop 브랜치명
 * @param {Object} params.targets - 타겟 설정
 * @param {boolean} params.targets.dev - develop sync 여부
 * @param {boolean} params.targets.qa - qa sync 여부
 * @returns {Promise<string>} 생성된 명령어 문자열
 */
async function generateAllSyncCommands({
  repoPath,
  baseBranch,
  qaBranch,
  devBranch,
  targets,
}) {
  const output = [`# 작업 경로: ${repoPath}`, `# source: ${baseBranch}`, ``];

  if (targets.dev) {
    const txt = await generateSyncFor({
      targetBranch: devBranch,
      baseBranch,
      repoPath,
    });
    output.push(txt);
  }

  if (targets.qa) {
    const txt = await generateSyncFor({
      targetBranch: qaBranch,
      baseBranch,
      repoPath,
    });
    output.push(txt);
  }

  return output.join("\n");
}

module.exports = {
  generateSyncFor,
  generateAllSyncCommands,
};

