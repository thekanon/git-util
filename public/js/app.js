const STATE_KEY = "gitNodeToolState";

/**
 * localStorage에서 상태 로드
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);

    document.getElementById("ticket").value = state.ticket || "";
    document.getElementById("work").value = state.work || "";
    document.getElementById("employee").value = state.employee || "";
    document.getElementById("syncDev").checked = !!state.syncDev;
    document.getElementById("syncQa").checked = !!state.syncQa;
  } catch (e) {
    // 무시
  }
}

/**
 * 상태를 localStorage에 저장
 */
function saveState() {
  const state = {
    ticket: document.getElementById("ticket").value,
    work: document.getElementById("work").value,
    employee: document.getElementById("employee").value,
    syncDev: document.getElementById("syncDev").checked,
    syncQa: document.getElementById("syncQa").checked,
  };
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    // 무시
  }
}

/**
 * JSON POST 요청 유틸리티
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
 * JSON GET 요청 유틸리티
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
 * 브랜치 생성 명령어 생성
 */
async function generateBranches() {
  const ticket = document.getElementById("ticket").value.trim();
  const work = document.getElementById("work").value.trim();
  const employee = document.getElementById("employee").value.trim();
  const out = document.getElementById("branchesOutput");

  if (!ticket || !work || !employee) {
    alert("티켓명 / 작업명 / 사번을 모두 입력하세요.");
    return;
  }

  saveState();
  out.value = "# 요청 중...";

  try {
    const data = await postJson("/api/create-commands", {
      ticket,
      work,
      employee,
    });
    out.value = data.commands || "";
  } catch (e) {
    out.value = `# 에러: ${e.message}`;
  }
}

/**
 * Sync 명령어 생성
 */
async function generateSync() {
  const ticket = document.getElementById("ticket").value.trim();
  const work = document.getElementById("work").value.trim();
  const employee = document.getElementById("employee").value.trim();
  const syncDev = document.getElementById("syncDev").checked;
  const syncQa = document.getElementById("syncQa").checked;
  const out = document.getElementById("syncOutput");

  if (!ticket || !work || !employee) {
    alert("티켓명 / 작업명 / 사번을 모두 입력하세요.");
    return;
  }
  if (!syncDev && !syncQa) {
    alert("develop 또는 qa 중 최소 하나를 선택하세요.");
    return;
  }

  saveState();
  out.value = "# 요청 중...";

  try {
    const data = await postJson("/api/sync-commands", {
      ticket,
      work,
      employee,
      targets: { dev: syncDev, qa: syncQa },
    });
    out.value = data.commands || "";
  } catch (e) {
    out.value = `# 에러: ${e.message}`;
  }
}

/**
 * 브랜치 목록 로드
 */
async function loadBranchesList() {
  const listEl = document.getElementById("branchList");
  listEl.textContent = "불러오는 중...";

  try {
    const data = await getJson("/api/branches");
    if (!data.ok) {
      listEl.textContent = "브랜치 목록 조회 실패";
      return;
    }

    if (!data.branches || data.branches.length === 0) {
      listEl.textContent = "로컬 브랜치가 없습니다.";
      return;
    }

    listEl.innerHTML = "";
    data.branches.forEach((b, idx) => {
      const id = `branch-chk-${idx}`;
      const wrapper = document.createElement("div");

      const label = document.createElement("label");
      label.className = "branch-item-label";
      label.htmlFor = id;

      const left = document.createElement("span");
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.id = id;
      cb.value = b.name;
      cb.style.marginRight = "6px";

      const nameSpan = document.createElement("span");
      nameSpan.className = "branch-name";
      nameSpan.textContent = b.name;

      left.appendChild(cb);
      left.appendChild(nameSpan);

      const dateSpan = document.createElement("span");
      dateSpan.className = "branch-date";
      dateSpan.textContent = b.date || "";

      label.appendChild(left);
      label.appendChild(dateSpan);

      wrapper.appendChild(label);
      listEl.appendChild(wrapper);
    });
  } catch (e) {
    listEl.textContent = `브랜치 목록 조회 중 에러: ${e.message}`;
  }
}

/**
 * 브랜치 삭제 명령어 생성
 */
function generateDeleteCommands() {
  const listEl = document.getElementById("branchList");
  const out = document.getElementById("branchDeleteOutput");
  const checkboxes = listEl.querySelectorAll("input[type=checkbox]:checked");

  const names = Array.from(checkboxes).map((cb) => cb.value);

  if (names.length === 0) {
    alert("삭제할 브랜치를 하나 이상 선택하세요.");
    return;
  }

  const lines = [];
  lines.push("# 선택한 로컬 브랜치 삭제");
  names.forEach((name) => {
    lines.push(`git branch -D ${name}`);
  });

  out.value = lines.join("\n");
}

// DOM 로드 완료 시 초기화
document.addEventListener("DOMContentLoaded", () => {
  loadState();

  document
    .getElementById("btnBranches")
    .addEventListener("click", generateBranches);
  document.getElementById("btnSync").addEventListener("click", generateSync);
  document
    .getElementById("btnLoadBranches")
    .addEventListener("click", loadBranchesList);
  document
    .getElementById("btnDeleteCmd")
    .addEventListener("click", generateDeleteCommands);

  ["ticket", "work", "employee", "syncDev", "syncQa"].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("change", saveState);
    if (el.tagName === "INPUT" && el.type === "text") {
      el.addEventListener("keyup", saveState);
    }
  });
});

