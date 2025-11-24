const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Git 명령어 실행 유틸리티
 * @param {string} cmd - 실행할 git 명령어
 * @param {string} cwd - 작업 디렉토리 경로
 * @returns {Promise<{stdout: string, stderr: string}>}
 */
async function runCommand(cmd, cwd = ".") {
  try {
    const { stdout, stderr } = await execAsync(cmd, { cwd });
    return { stdout, stderr };
  } catch (error) {
    throw {
      err: error,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
    };
  }
}

/**
 * 작업명을 브랜치명에 사용할 수 있는 형식으로 변환
 * @param {string} raw - 원본 작업명
 * @returns {string} 변환된 작업명
 */
function slugifyWorkName(raw) {
  let s = raw.trim();
  if (!s) return "";
  s = s.replace(/\s+/g, "_");
  s = s.replace(/[^\w가-힣_\-]/g, "");
  return s;
}

/**
 * 티켓, 작업명, 사번으로부터 브랜치명 생성
 * @param {string} ticket - 티켓명
 * @param {string} work - 작업명
 * @param {string} employee - 사번
 * @returns {{baseBranch: string, qaBranch: string, devBranch: string}}
 */
function getBranchNames(ticket, work, employee) {
  const workSlug = slugifyWorkName(work);
  const baseBranch = `feature/${ticket}-${workSlug}-${employee}`;
  const qaBranch = `${baseBranch}-qa`;
  const devBranch = `${baseBranch}-develop`;
  return { baseBranch, qaBranch, devBranch };
}

/**
 * 에러 객체에서 메시지 추출
 * @param {any} error - 에러 객체
 * @param {string} defaultMessage - 기본 메시지
 * @returns {string}
 */
function extractErrorMessage(error, defaultMessage = "알 수 없는 오류") {
  return (
    error?.stderr ||
    error?.stdout ||
    error?.err?.message ||
    error?.message ||
    defaultMessage
  );
}

module.exports = {
  runCommand,
  slugifyWorkName,
  getBranchNames,
  extractErrorMessage,
};

