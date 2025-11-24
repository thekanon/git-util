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
 * @param {string} params.sourceBranch - baseBranch가 생성된 소스 브랜치 (기본값: pre-stage)
 * @returns {Promise<string>} 생성된 명령어 문자열
 */
async function generateSyncFor({
  targetBranch,
  baseBranch,
  repoPath,
  sourceBranch = "pre-stage",
}) {
  try {
    // 1. baseBranch가 생성된 이후의 커밋만 가져오기 (sourceBranch에는 없고 baseBranch에만 있는 커밋)
    const baseBranchCmd = `git log --reverse --no-merges --format=%H ${sourceBranch}..${baseBranch}`;
    const baseResult = await runCommand(baseBranchCmd, repoPath);
    const baseHashes = baseResult.stdout
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    // 2. 타겟 브랜치의 모든 커밋 가져오기
    const targetBranchCmd = `git log --reverse --no-merges --format=%H ${targetBranch}`;
    const targetResult = await runCommand(targetBranchCmd, repoPath);
    const targetHashes = targetResult.stdout
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    // 3. 타겟 브랜치에 이미 있는 커밋을 Set으로 변환 (빠른 조회를 위해)
    const targetHashesSet = new Set(targetHashes);

    // 4. baseBranch 생성 이후 커밋 중 타겟 브랜치에 없는 커밋만 필터링
    const neededHashes = baseHashes.filter(
      (hash) => !targetHashesSet.has(hash)
    );

    if (neededHashes.length === 0) {
      return [`# ${targetBranch} → cherry-pick할 신규 커밋 없음`, ""].join(
        "\n"
      );
    }

    const lines = [`# ${targetBranch} sync`, `git checkout ${targetBranch}`];

    neededHashes.forEach((hash) => {
      lines.push(`git cherry-pick ${hash}`);
    });

    lines.push(""); // 빈 줄

    return lines.join("\n");
  } catch (error) {
    const msg = extractErrorMessage(
      error,
      `git log 실행 오류 (${baseBranch} → ${targetBranch})`
    );
    return [`# ${targetBranch} sync 중 오류`, `# ${msg}`, ""].join("\n");
  }
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
 * @param {string} params.sourceBranch - baseBranch가 생성된 소스 브랜치
 * @returns {Promise<string>} 생성된 명령어 문자열
 */
async function generateAllSyncCommands({
  repoPath,
  baseBranch,
  qaBranch,
  devBranch,
  targets,
  sourceBranch = "pre-stage",
}) {
  const output = [`# 작업 경로: ${repoPath}`, `# source: ${baseBranch}`, ``];

  if (targets.dev) {
    const txt = await generateSyncFor({
      targetBranch: devBranch,
      baseBranch,
      repoPath,
      sourceBranch,
    });
    output.push(txt);
  }

  if (targets.qa) {
    const txt = await generateSyncFor({
      targetBranch: qaBranch,
      baseBranch,
      repoPath,
      sourceBranch,
    });
    output.push(txt);
  }

  return output.join("\n");
}

module.exports = {
  generateSyncFor,
  generateAllSyncCommands,
};
