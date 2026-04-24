# AI 中心 開發藍圖 · 資料庫 Schema 規劃

這份文件規劃本 Dashboard 未來串接 SQL 資料庫時需要的資料表、欄位、索引與 API。目前前端使用 `localStorage` 暫存編輯，之後可依此設計無縫遷移到後端。

---

## 一、資料表總覽

| 資料表 | 中文 | 說明 |
| - | - | - |
| `departments` | 部門 | 評價部、管理部，未來可擴充 |
| `users` | 使用者 | 可登入者、專案負責人、細項指派對象 |
| `projects` | 開發項目 | 對應 Excel 藍圖每一列，含手動新增 |
| `project_owners` | 專案負責人 | 多對多（一個項目可多人） |
| `subtasks` | 細項任務 | 每個項目下的具體待辦 |
| `status_history` | 狀態變更記錄 | 審計追蹤（optional） |
| `activity_logs` | 活動記錄 | 所有變更事件（optional） |
| `tags` | 標籤字典 | 標籤統一管理（optional） |

---

## 二、MySQL / MariaDB Schema

```sql
-- ====== 部門 ======
CREATE TABLE departments (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code            VARCHAR(32)   NOT NULL UNIQUE COMMENT '部門代碼，例：valuation / management',
  name            VARCHAR(64)   NOT NULL       COMMENT '部門名稱，例：評價部 / 管理部',
  sort_order      INT           NOT NULL DEFAULT 0,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) COMMENT = '客戶部門（未來 AI 中心可服務的部門）';

-- ====== 使用者 ======
CREATE TABLE users (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email           VARCHAR(128)  NOT NULL UNIQUE,
  display_name    VARCHAR(64)   NOT NULL       COMMENT '顯示名稱（例：Louis）',
  role            ENUM('admin','editor','viewer') NOT NULL DEFAULT 'editor',
  department_id   BIGINT UNSIGNED NULL         COMMENT '所屬部門，可為 NULL（例：AI 中心員工）',
  avatar_url      VARCHAR(255)  NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  last_login_at   TIMESTAMP     NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ====== 開發項目 ======
CREATE TABLE projects (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code            VARCHAR(64)   UNIQUE         COMMENT '業務代號，例：val-01（可為 NULL）',
  department_id   BIGINT UNSIGNED NOT NULL,
  name            VARCHAR(255)  NOT NULL       COMMENT '項目名稱',
  status          ENUM('planning','in_progress','done','archived') NOT NULL DEFAULT 'planning',
  tag             VARCHAR(64)   NULL           COMMENT '分類標籤，例：爬蟲、評價參數',
  frequency       VARCHAR(64)   NULL           COMMENT '執行頻率，例：每個案件、每月 1 次',

  -- 藍圖三欄（來自 Excel）
  ai_direction    TEXT          NULL           COMMENT '希望 AI 改善方向',
  expected_output TEXT          NULL           COMMENT '預期輸出成果',
  logic           TEXT          NULL           COMMENT '任務步驟 / 邏輯',

  -- 排程
  planned_start   DATE          NULL,
  planned_end     DATE          NULL,
  actual_start    DATE          NULL,
  actual_end      DATE          NULL,

  -- 進度
  manual_progress TINYINT UNSIGNED NULL        COMMENT '手動進度 0-100；NULL 表示依細項自動計算',
  notes           TEXT          NULL,

  -- 排序、狀態
  sort_order      INT           NOT NULL DEFAULT 0,
  is_custom       TINYINT(1)    NOT NULL DEFAULT 0 COMMENT '1=使用者新增；0=來自 Excel 藍圖',
  is_archived     TINYINT(1)    NOT NULL DEFAULT 0,

  -- 審計
  created_by      BIGINT UNSIGNED NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by      BIGINT UNSIGNED NULL,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  FOREIGN KEY (created_by)    REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (updated_by)    REFERENCES users(id) ON DELETE SET NULL,

  INDEX idx_dept_status (department_id, status),
  INDEX idx_status (status),
  INDEX idx_planned (planned_end),
  INDEX idx_tag (tag)
);

-- ====== 專案負責人（多對多）======
CREATE TABLE project_owners (
  project_id      BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  role_in_project VARCHAR(32)   NOT NULL DEFAULT 'owner' COMMENT 'owner / co-owner / reviewer',
  assigned_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (project_id, user_id),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

-- ====== 細項任務 ======
CREATE TABLE subtasks (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id      BIGINT UNSIGNED NOT NULL,
  title           VARCHAR(255)  NOT NULL,
  description     TEXT          NULL,
  is_done         TINYINT(1)    NOT NULL DEFAULT 0,
  due_date        DATE          NULL,
  assignee_id     BIGINT UNSIGNED NULL,
  sort_order      INT           NOT NULL DEFAULT 0,
  completed_at    TIMESTAMP     NULL,
  created_by      BIGINT UNSIGNED NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id)  REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (assignee_id) REFERENCES users(id)    ON DELETE SET NULL,
  FOREIGN KEY (created_by)  REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_project (project_id),
  INDEX idx_assignee (assignee_id),
  INDEX idx_due (due_date)
);

-- ====== 狀態變更記錄 ======
CREATE TABLE status_history (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  project_id      BIGINT UNSIGNED NOT NULL,
  from_status     VARCHAR(32)   NULL,
  to_status       VARCHAR(32)   NOT NULL,
  changed_by      BIGINT UNSIGNED NULL,
  changed_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  note            VARCHAR(255)  NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id)    ON DELETE SET NULL,
  INDEX idx_project_time (project_id, changed_at)
);

-- ====== 活動記錄（通用）======
CREATE TABLE activity_logs (
  id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  entity_type     ENUM('project','subtask','department') NOT NULL,
  entity_id       BIGINT UNSIGNED NOT NULL,
  action          ENUM('create','update','delete','status_change') NOT NULL,
  changes         JSON          NULL COMMENT '{ field: [old, new], ... }',
  actor_id        BIGINT UNSIGNED NULL,
  actor_ip        VARCHAR(45)   NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_actor_time (actor_id, created_at)
);
```

---

## 三、PostgreSQL 版本差異

如果選用 PostgreSQL，以下欄位要調整：

```sql
-- 取代 AUTO_INCREMENT
id BIGSERIAL PRIMARY KEY

-- 取代 TINYINT(1)
is_active BOOLEAN NOT NULL DEFAULT TRUE

-- 取代 ENUM（改用 CHECK 或自訂 type）
status VARCHAR(32) NOT NULL DEFAULT 'planning'
  CHECK (status IN ('planning','in_progress','done','archived'))

-- 取代 ON UPDATE CURRENT_TIMESTAMP（要用 trigger）
-- 建立一個通用 trigger
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 四、初始資料（seed）

```sql
-- 部門
INSERT INTO departments (code, name, sort_order) VALUES
  ('valuation', '評價部', 1),
  ('management', '管理部', 2);

-- Excel 藍圖 33 項 + 3 項已完成 + 管理部 2 項 ...（由遷移腳本匯入）
```

---

## 五、進度計算邏輯

項目 `progress` 不直接存在資料表，由以下規則動態算出（API 或 View）：

1. 若 `projects.manual_progress IS NOT NULL` → 直接使用
2. 否則若該項目有細項（subtasks）→ `COUNT(is_done=1) / COUNT(*) * 100`
3. 否則若 `status = 'done'` → 100；`status = 'in_progress'` → 可用預設值（例 50）；`planning` → 0

SQL View 範例：

```sql
CREATE VIEW v_project_progress AS
SELECT
  p.id,
  p.name,
  p.status,
  COALESCE(
    p.manual_progress,
    CASE WHEN st.total > 0 THEN ROUND(st.done * 100.0 / st.total) END,
    CASE p.status WHEN 'done' THEN 100 WHEN 'in_progress' THEN 50 ELSE 0 END
  ) AS progress_pct
FROM projects p
LEFT JOIN (
  SELECT project_id,
         COUNT(*) AS total,
         SUM(CASE WHEN is_done=1 THEN 1 ELSE 0 END) AS done
  FROM subtasks GROUP BY project_id
) st ON st.project_id = p.id;
```

---

## 六、API 端點規劃

| Method | Path | 說明 |
| - | - | - |
| GET  | `/api/departments`                     | 所有部門（含項目數、完成率） |
| GET  | `/api/projects?department=&status=&q=` | 專案列表（含 filter） |
| POST | `/api/projects`                        | 新增專案 |
| GET  | `/api/projects/:id`                    | 單一專案詳情（含 subtasks） |
| PATCH| `/api/projects/:id`                    | 更新專案欄位 |
| DELETE | `/api/projects/:id`                  | 刪除（軟刪除 `is_archived=1`） |
| POST | `/api/projects/:id/subtasks`           | 新增細項 |
| PATCH| `/api/subtasks/:id`                    | 更新細項（勾選、改名、改日期） |
| DELETE | `/api/subtasks/:id`                  | 刪除細項 |
| GET  | `/api/users`                           | 使用者清單（下拉負責人用） |
| GET  | `/api/stats`                           | 總覽統計（首頁卡片） |

### Next.js 14 實作參考

使用 App Router 的 Route Handlers：

```
app/api/
├── departments/route.js        -> GET
├── projects/route.js           -> GET, POST
├── projects/[id]/route.js      -> GET, PATCH, DELETE
├── projects/[id]/subtasks/route.js -> POST
└── subtasks/[id]/route.js      -> PATCH, DELETE
```

搭配 ORM 建議：**Prisma** 或 **Drizzle**（Next.js 整合最順）。

---

## 七、從 localStorage 遷移到 DB

目前前端 localStorage key：

- `ai-center-blueprint-edits-v1`：排程 & 細項編輯
- `ai-center-custom-projects-v1`：使用者新增的項目（待實作）

遷移步驟：

1. 後端先建好資料表 + 灌入 Excel 藍圖 39 項基線資料
2. 加 API：GET `/api/projects`、POST `/api/projects`、PATCH `/api/projects/:id` 等
3. 前端在使用者登入後，讀 localStorage → 呼叫 API 批次同步 → 清除 localStorage
4. 之後所有編輯直接呼叫 API，不再用 localStorage

```js
async function migrateLocalStorageToDb() {
  const edits = JSON.parse(localStorage.getItem('ai-center-blueprint-edits-v1') || '{}');
  const customs = JSON.parse(localStorage.getItem('ai-center-custom-projects-v1') || '[]');

  for (const p of customs) {
    await fetch('/api/projects', { method:'POST', body: JSON.stringify(p) });
  }
  for (const [pid, edit] of Object.entries(edits)) {
    await fetch(`/api/projects/${pid}`, { method:'PATCH', body: JSON.stringify({
      planned_start: edit.plannedStart, planned_end: edit.plannedEnd,
      owner_email: edit.owner, notes: edit.notes,
    })});
    for (const st of edit.subtasks || []) {
      await fetch(`/api/projects/${pid}/subtasks`, { method:'POST', body: JSON.stringify(st) });
    }
  }
  localStorage.removeItem('ai-center-blueprint-edits-v1');
  localStorage.removeItem('ai-center-custom-projects-v1');
}
```

---

## 八、權限與存取（建議未來加上）

- 所有使用者可以查看
- 部門內使用者可編輯自己部門的項目排程與細項
- AI 中心管理員（admin）可編輯所有、新增部門、刪除項目
- 登入建議用 NextAuth.js（支援 Google OAuth / Email Magic Link）

---

## 九、ER 關係圖（文字版）

```
departments (1) ─── (N) users
departments (1) ─── (N) projects
users       (1) ─── (N) projects.created_by / updated_by
users       (M) ─── (N) projects  [via project_owners]
projects    (1) ─── (N) subtasks
users       (1) ─── (N) subtasks.assignee_id
projects    (1) ─── (N) status_history
*           (N) ─── (N) activity_logs  [polymorphic via entity_type/entity_id]
```

---

## 十、建議的推薦技術棧

| 層 | 選擇 | 理由 |
| - | - | - |
| DB | **PostgreSQL** (Neon / Supabase / Vercel Postgres) | 與 Vercel 整合好、免費額度足夠、JSON 欄位強 |
| ORM | **Prisma** | Schema-first、TypeScript 友善、migration 穩 |
| Auth | NextAuth.js (Auth.js) | 與 Next.js 整合最順 |
| API | Next.js Route Handlers | 不用另外開 server |
| 部署 | Vercel | 已規劃 |

快速建立：
```bash
npm i prisma @prisma/client
npx prisma init
# 把 schema.prisma 填好後：
npx prisma migrate dev --name init
npx prisma db seed
```

如需要，之後可以幫您把這份 schema 轉成 `schema.prisma` 檔案，直接能跑 migration。
