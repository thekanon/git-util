/**
 * 메인 애플리케이션 로직
 */

/**
 * 입력 검증
 */
function validateInput() {
  const { ticket, work, employee } = getFormValues();
  if (!ticket || !work || !employee) {
    alert("티켓명 / 작업명 / 사번을 모두 입력하세요.");
    return false;
  }
  return true;
}

/**
 * 브랜치 생성 명령어 생성
 */
async function generateBranches() {
  if (!validateInput()) return;

  const { ticket, work, employee } = getFormValues();
  const out = getElement("branchesOutput");

  saveState();
  saveCurrentTicket();
  out.value = "# 요청 중...";

  try {
    const data = await createBranchCommands(ticket, work, employee);
    out.value = data.commands || "";
  } catch (e) {
    out.value = `# 에러: ${e.message}`;
  }
}

/**
 * Sync 명령어 생성
 */
async function generateSync() {
  if (!validateInput()) return;

  const { ticket, work, employee, syncDev, syncQa } = getFormValues();
  const out = getElement("syncOutput");

  if (!syncDev && !syncQa) {
    alert("develop 또는 qa 중 최소 하나를 선택하세요.");
    return;
  }

  saveState();
  saveCurrentTicket();
  out.value = "# 요청 중...";

  try {
    const data = await createSyncCommands(ticket, work, employee, {
      dev: syncDev,
      qa: syncQa,
    });
    out.value = data.commands || "";
  } catch (e) {
    out.value = `# 에러: ${e.message}`;
  }
}

/**
 * 이벤트 리스너 설정
 */
function setupEventListeners() {
  // 티켓 관리
  getElement("ticketSelect").addEventListener("change", (e) => {
    const value = e.target.value;
    if (value === "") {
      loadTicket(null);
    } else {
      loadTicket(parseInt(value));
    }
  });

  getElement("btnDeleteTicket").addEventListener("click", deleteCurrentTicket);

  // 기능 버튼들
  getElement("btnBranches").addEventListener("click", generateBranches);
  getElement("btnSync").addEventListener("click", generateSync);
  getElement("btnLoadBranches").addEventListener("click", loadBranchesList);
  getElement("btnDeleteCmd").addEventListener("click", generateDeleteCommands);

  // 폼 변경 시 상태 저장
  ["ticket", "work", "employee", "syncDev", "syncQa"].forEach((id) => {
    const el = getElement(id);
    el.addEventListener("change", saveState);
    if (el.tagName === "INPUT" && el.type === "text") {
      el.addEventListener("keyup", saveState);
    }
  });
}

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  setupEventListeners();
});
