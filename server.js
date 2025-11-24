const express = require("express");
const path = require("path");
const config = require("./utils/config");
const branchesRouter = require("./routes/branches");
const createCommandsRouter = require("./routes/create-commands");
const syncCommandsRouter = require("./routes/sync-commands");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// 설정을 app.locals에 저장하여 라우터에서 접근 가능하도록 함
app.locals.config = config;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API 라우트
app.use("/api/branches", branchesRouter);
app.use("/api/create-commands", createCommandsRouter);
app.use("/api/sync-commands", syncCommandsRouter);

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({ ok: false, error: "요청한 리소스를 찾을 수 없습니다" });
});

// 에러 핸들러 (마지막에 위치해야 함)
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Running at http://localhost:${config.port}`);
  console.log(`Repo path = ${config.repoPath}`);
});
