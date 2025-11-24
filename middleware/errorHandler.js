const { extractErrorMessage } = require("../utils/git");

/**
 * 에러 처리 미들웨어
 */
function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  // 이미 응답이 전송된 경우
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = extractErrorMessage(err, "서버 오류가 발생했습니다");

  res.status(statusCode).json({
    ok: false,
    error: message,
  });
}

module.exports = errorHandler;

