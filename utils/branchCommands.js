/**
 * 브랜치 생성 명령어 생성 유틸리티
 */

/**
 * 특정 base 브랜치에서 feature 브랜치를 생성하는 명령어 생성
 * @param {string} baseBranch - base 브랜치명 (pre-stage, qa-stage, develop)
 * @param {string} featureBranch - 생성할 feature 브랜치명
 * @param {string} repoPath - 작업 경로
 * @returns {string[]} 명령어 배열
 */
function generateBranchCreationCommands(baseBranch, featureBranch, repoPath) {
  return [
    `# ${baseBranch} 기반 feature 브랜치 생성`,
    `git checkout ${baseBranch}`,
    `git pull`,
    `git checkout -b ${featureBranch}`,
    `git push --set-upstream origin ${featureBranch}`,
    "",
  ];
}

/**
 * 모든 브랜치 생성 명령어 생성
 * @param {Object} params - 브랜치 생성 파라미터
 * @param {string} params.repoPath - 작업 경로
 * @param {Object} params.baseBranches - base 브랜치 설정
 * @param {string} params.baseBranch - base 브랜치명
 * @param {string} params.qaBranch - QA 브랜치명
 * @param {string} params.devBranch - Develop 브랜치명
 * @returns {string} 생성된 명령어 문자열
 */
function generateAllBranchCommands({
  repoPath,
  baseBranches,
  baseBranch,
  qaBranch,
  devBranch,
}) {
  const cmds = [`# 작업 경로: ${repoPath}`];

  // pre-stage 기반 브랜치 생성
  cmds.push(
    ...generateBranchCreationCommands(
      baseBranches.preStage,
      baseBranch,
      repoPath
    )
  );

  // qa-stage 기반 브랜치 생성
  cmds.push(
    ...generateBranchCreationCommands(
      baseBranches.qaStage,
      qaBranch,
      repoPath
    )
  );

  // develop 기반 브랜치 생성
  cmds.push(
    ...generateBranchCreationCommands(
      baseBranches.develop,
      devBranch,
      repoPath
    )
  );

  // 마지막으로 base 브랜치로 체크아웃
  cmds.push(`git checkout ${baseBranch}`, `git branch`);

  return cmds.join("\n");
}

module.exports = {
  generateBranchCreationCommands,
  generateAllBranchCommands,
};


