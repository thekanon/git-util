/**
 * DOM 유틸리티 함수
 */

/**
 * 요소 가져오기
 */
function getElement(id) {
  return document.getElementById(id);
}

/**
 * 폼 값 가져오기
 */
function getFormValues() {
  return {
    ticket: getElement("ticket").value.trim(),
    work: getElement("work").value.trim(),
    employee: getElement("employee").value.trim(),
    syncDev: getElement("syncDev").checked,
    syncQa: getElement("syncQa").checked,
  };
}

/**
 * 폼 값 설정
 */
function setFormValues(values) {
  getElement("ticket").value = values.ticket || "";
  getElement("work").value = values.work || "";
  getElement("employee").value = values.employee || "";
  getElement("syncDev").checked = !!values.syncDev;
  getElement("syncQa").checked = !!values.syncQa;
}

/**
 * 폼 초기화
 */
function resetForm() {
  setFormValues({
    ticket: "",
    work: "",
    employee: "",
    syncDev: false,
    syncQa: false,
  });
}

