/**
 * API 호출 유틸리티
 */

/**
 * JSON POST 요청
 */
async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let msg = "요청 실패";
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/**
 * JSON GET 요청
 */
async function getJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    let msg = "요청 실패";
    try {
      const data = await res.json();
      if (data.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

/**
 * 브랜치 생성 명령어 요청
 */
async function createBranchCommands(ticket, work, employee) {
  return postJson("/api/create-commands", { ticket, work, employee });
}

/**
 * Sync 명령어 요청
 */
async function createSyncCommands(ticket, work, employee, targets) {
  return postJson("/api/sync-commands", {
    ticket,
    work,
    employee,
    targets,
  });
}

/**
 * 브랜치 목록 조회
 */
async function getBranches() {
  return getJson("/api/branches");
}

