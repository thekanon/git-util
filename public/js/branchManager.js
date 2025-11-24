/**
 * 브랜치 관리 모듈
 */

/**
 * 브랜치 목록 로드
 */
async function loadBranchesList() {
  const listEl = getElement("branchList");
  listEl.textContent = "불러오는 중...";

  try {
    const data = await getBranches();
    if (!data.ok) {
      listEl.textContent = "브랜치 목록 조회 실패";
      return;
    }

    if (!data.branches || data.branches.length === 0) {
      listEl.textContent = "로컬 브랜치가 없습니다.";
      return;
    }

    renderBranchList(data.branches);
  } catch (e) {
    listEl.textContent = `브랜치 목록 조회 중 에러: ${e.message}`;
  }
}

/**
 * 브랜치 목록 렌더링
 */
function renderBranchList(branches) {
  const listEl = getElement("branchList");
  listEl.innerHTML = "";

  branches.forEach((b, idx) => {
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
}

/**
 * 브랜치 삭제 명령어 생성
 */
function generateDeleteCommands() {
  const listEl = getElement("branchList");
  const out = getElement("branchDeleteOutput");
  const checkboxes = listEl.querySelectorAll("input[type=checkbox]:checked");

  const names = Array.from(checkboxes).map((cb) => cb.value);

  if (names.length === 0) {
    alert("삭제할 브랜치를 하나 이상 선택하세요.");
    return;
  }

  const lines = ["# 선택한 로컬 브랜치 삭제"];
  names.forEach((name) => {
    lines.push(`git branch -D ${name}`);
  });

  out.value = lines.join("\n");
}


