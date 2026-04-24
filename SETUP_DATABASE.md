# 資料庫設置手冊（MySQL + Prisma）

您的 DB：`mysql://root@mysql.wauyuan.org:33307/blueprint`

---

## 第 0 步：安全加固（強烈建議先做）

目前這個連線是 **root + 公網** ，等於整台 MySQL 主機都對外暴露。建議在 DBeaver 先執行：

```sql
-- 1. 建立專案專用帳號
CREATE DATABASE IF NOT EXISTS blueprint CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'blueprint_user'@'%' IDENTIFIED BY '請改成強密碼';
GRANT ALL PRIVILEGES ON blueprint.* TO 'blueprint_user'@'%';
FLUSH PRIVILEGES;

-- 2. 之後 .env.local 改用這個帳號
-- DATABASE_URL="mysql://blueprint_user:新密碼@mysql.wauyuan.org:33307/blueprint"
```

可以先跳過，但記得上線前一定要改。

---

## 第 1 步：安裝套件（在 D:\AI-center藍圖系統 執行）

```powershell
npm install
```

這會安裝 `prisma` 和 `@prisma/client`，並自動執行 `prisma generate`。

---

## 第 2 步：確認連線 + 建立資料表

```powershell
npx prisma db push
```

這會讀取 `prisma/schema.prisma`，在您的 `blueprint` database 裡建立 6 張資料表：
`departments`、`users`、`projects`、`project_owners`、`subtasks`、`status_history`

成功會看到：
```
Your database is now in sync with your Prisma schema. Done in 2.3s
```

若連線失敗，常見原因：
- 公司防火牆擋 33307 port → 用自己的網路試
- 密碼錯 → 確認 `.env.local`
- DB 不存在 → `CREATE DATABASE blueprint;`

---

## 第 3 步：灌入 Excel 藍圖 39 項

```powershell
npm run db:seed
```

會看到：
```
--- Seeding departments ---
  ✓ valuation -> 評價部 (id=1)
  ✓ management -> 管理部 (id=2)

--- Seeding projects (39) ---
..........  10
..........  20
..........  30
.........

✔ Seed complete. Total projects in DB: 39
```

**重複執行是安全的** —— 用 upsert 以 `code` 為 key，既有資料會被更新，不會重複。

---

## 第 4 步：用 DBeaver 或 Prisma Studio 檢查

**Prisma Studio（推薦，直接在瀏覽器操作資料）：**
```powershell
npm run db:studio
```
會開 http://localhost:5555

**DBeaver：** 連到 `blueprint` database，應該看到 6 張表，`projects` 有 39 筆資料。

---

## 第 5 步：測試 API 端點

啟動 dev server：
```powershell
npm run dev
```

在瀏覽器打開這些網址，應該都回傳 JSON：

| URL | 說明 |
| - | - |
| http://localhost:3000/api/departments | 部門清單 |
| http://localhost:3000/api/projects | 39 項專案 |
| http://localhost:3000/api/projects?department=評價部 | 37 項 |
| http://localhost:3000/api/projects?status=已完成 | 4 項 |

用 PowerShell 測 POST：
```powershell
curl -Method POST http://localhost:3000/api/projects `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"name":"測試項目","department":"評價部","status":"規劃中"}'
```

---

## 第 6 步：部署到 Vercel

1. Push 到 GitHub（`.env.local` 不會被 push，放心）
2. Vercel → Project → **Settings → Environment Variables** → 新增：
   - Name: `DATABASE_URL`
   - Value: `mysql://blueprint_user:新密碼@mysql.wauyuan.org:33307/blueprint`
   - Environments: ✔ Production / ✔ Preview / ✔ Development
3. Redeploy

**重要**：Vercel 的伺服器要連得到 `mysql.wauyuan.org:33307`。如果您的 MySQL 主機有 IP 白名單，要把 Vercel 的 IP 加進去（或用 `0.0.0.0/0` 但不建議）。

---

## 常用指令速查

| 指令 | 作用 |
| - | - |
| `npx prisma db push` | 推送 schema 變更到 DB（開發用） |
| `npx prisma migrate dev --name xxx` | 建立正式 migration（上線用） |
| `npx prisma generate` | 重新生成 Prisma Client |
| `npm run db:seed` | 灌入初始資料（可重複執行） |
| `npm run db:studio` | 開圖形化資料庫編輯器 |
| `npx prisma db pull` | 反向：從 DB 拉 schema 回 Prisma |

---

## 架構對照

```
Browser / iPad
    ↓  HTTP
Next.js (Vercel)
    ↓  Prisma Client
MySQL (mysql.wauyuan.org:33307/blueprint)
    ↑  DBeaver 直連管理
```

---

## 專案結構新增的檔案

```
AI-center藍圖系統/
├── .env.local                   # DB 連線字串（gitignored）
├── .env.example                 # 範例（可 commit）
├── prisma/
│   ├── schema.prisma           # Schema 定義
│   └── seed.js                  # 初始資料（39 項）
├── lib/
│   └── prisma.js                # Prisma Client singleton
└── app/api/
    ├── _serialize.js            # 序列化 helper
    ├── departments/route.js     # GET/POST
    ├── projects/
    │   ├── route.js             # GET/POST（列表/新增）
    │   └── [id]/
    │       ├── route.js         # GET/PATCH/DELETE
    │       └── subtasks/route.js # POST（新增細項）
    └── subtasks/[id]/route.js   # PATCH/DELETE
```

---

## 下一步（目前前端還用 localStorage）

目前 Dashboard 元件仍使用 localStorage 暫存。Schema、API 都已備好。
要切到 API 模式時，說一聲就幫您改（需要一些 loading 狀態處理）。

兩種切換策略：
- **A. 全改 API**：所有讀寫走 API，localStorage 完全退場
- **B. 漸進式**：先加一個「同步到資料庫」按鈕，把 localStorage 的資料推到 DB；成功後再切讀取端
