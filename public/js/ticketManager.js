/**
 * 티켓 관리 모듈
 */

/**
 * 티켓 목록 가져오기
 */
function getTickets() {
  try {
    const raw = localStorage.getItem(TICKETS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

/**
 * 티켓 목록 저장
 */
function saveTickets(tickets) {
  try {
    const limitedTickets = tickets.slice(0, MAX_TICKETS);
    localStorage.setItem(TICKETS_KEY, JSON.stringify(limitedTickets));
  } catch (e) {
    console.error("티켓 저장 실패:", e);
  }
}

/**
 * 현재 폼의 티켓 정보 가져오기
 */
function getCurrentTicket() {
  const values = getFormValues();
  return {
    ...values,
    createdAt: new Date().toISOString(),
  };
}

/**
 * 현재 티켓의 인덱스 가져오기
 */
function getCurrentTicketIndex() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return state.currentTicketIndex !== undefined
      ? state.currentTicketIndex
      : null;
  } catch (e) {
    return null;
  }
}

/**
 * 현재 티켓 인덱스 저장
 */
function saveCurrentTicketIndex(index) {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    const state = raw ? JSON.parse(raw) : {};
    state.currentTicketIndex = index;
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    // 무시
  }
}

/**
 * 티켓 목록 UI 업데이트
 */
function updateTicketSelect() {
  const select = getElement("ticketSelect");
  const tickets = getTickets();

  // 기존 옵션 제거 (첫 번째 "새 티켓 추가..." 제외)
  while (select.options.length > 1) {
    select.remove(1);
  }

  // 티켓 목록 추가
  tickets.forEach((t, index) => {
    const option = document.createElement("option");
    const displayName = `${t.ticket} - ${t.work || "작업명 없음"} (${
      t.employee || "사번 없음"
    })`;
    option.value = index;
    option.textContent = displayName;
    select.appendChild(option);
  });

  // 현재 선택된 티켓이 있으면 선택 상태 유지
  const currentIndex = getCurrentTicketIndex();
  if (currentIndex !== null) {
    select.value = currentIndex;
  }
}

/**
 * 티켓 선택 시 폼에 로드
 */
function loadTicket(index) {
  const tickets = getTickets();
  if (index === null || index < 0 || index >= tickets.length) {
    resetForm();
    saveCurrentTicketIndex(null);
    return;
  }

  const ticket = tickets[index];
  setFormValues({
    ticket: ticket.ticket || "",
    work: ticket.work || "",
    employee: ticket.employee || "",
    syncDev: !!ticket.syncDev,
    syncQa: !!ticket.syncQa,
  });
  saveCurrentTicketIndex(index);
}

/**
 * 현재 티켓 저장
 */
function saveCurrentTicket() {
  const current = getCurrentTicket();

  // 티켓명이 없으면 저장하지 않음
  if (!current.ticket) {
    return;
  }

  const tickets = getTickets();
  const currentIndex = getCurrentTicketIndex();

  if (
    currentIndex !== null &&
    currentIndex >= 0 &&
    currentIndex < tickets.length
  ) {
    // 기존 티켓 업데이트
    tickets[currentIndex] = {
      ...current,
      createdAt: tickets[currentIndex].createdAt,
    };
  } else {
    // 새 티켓 추가
    tickets.unshift(current);
  }

  saveTickets(tickets);
  updateTicketSelect();

  // 새로 추가된 경우 첫 번째 항목 선택
  if (currentIndex === null && tickets.length > 0) {
    getElement("ticketSelect").value = 0;
    saveCurrentTicketIndex(0);
  }
}

/**
 * 선택된 티켓 삭제
 */
function deleteCurrentTicket() {
  const select = getElement("ticketSelect");
  const currentIndex = parseInt(select.value);

  if (isNaN(currentIndex) || currentIndex < 0) {
    alert("삭제할 티켓을 선택하세요.");
    return;
  }

  if (!confirm("정말 이 티켓을 삭제하시겠습니까?")) {
    return;
  }

  const tickets = getTickets();
  tickets.splice(currentIndex, 1);
  saveTickets(tickets);
  updateTicketSelect();

  // 폼 초기화
  loadTicket(null);
  select.value = "";

  alert("티켓이 삭제되었습니다.");
}

/**
 * 상태 로드 (하위 호환성 유지)
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    const state = JSON.parse(raw);

    // 기존 단일 티켓 형식 지원
    if (state.ticket !== undefined) {
      setFormValues({
        ticket: state.ticket || "",
        work: state.work || "",
        employee: state.employee || "",
        syncDev: !!state.syncDev,
        syncQa: !!state.syncQa,
      });
    }

    // 티켓 목록 UI 업데이트
    updateTicketSelect();

    // 저장된 티켓이 있으면 로드
    const currentIndex = getCurrentTicketIndex();
    if (currentIndex !== null) {
      loadTicket(currentIndex);
    }
  } catch (e) {
    // 무시
  }
}

/**
 * 상태 저장 (하위 호환성 유지)
 */
function saveState() {
  const values = getFormValues();
  const state = {
    ticket: values.ticket,
    work: values.work,
    employee: values.employee,
    syncDev: values.syncDev,
    syncQa: values.syncQa,
  };
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch (e) {
    // 무시
  }
}


