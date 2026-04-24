# AI 中心 · 開發藍圖 Dashboard

華淵鑑價 AI 中心的開發項目追蹤儀表板。資料來源為 `2026 數位轉型總藍圖`，並整理為可視化的 Dashboard 介面，方便主管追蹤各部門 AI 項目進度。

## 技術

- Next.js 14 (App Router)
- React 18
- Tailwind CSS 3
- 部署目標：Vercel

## 專案結構

```
AI-center藍圖系統/
├── app/
│   ├── globals.css        # 全域樣式
│   ├── layout.jsx         # 根 Layout
│   └── page.jsx           # 首頁（載入 Dashboard）
├── components/
│   ├── Dashboard.jsx          # 主容器
│   ├── StatsOverview.jsx      # 頂部統計卡片
│   ├── DepartmentProgress.jsx # 部門進度區塊
│   ├── FilterBar.jsx          # 篩選列
│   └── ProjectTable.jsx       # 項目列表（可展開）
├── data/
│   └── projects.js        # 專案資料（所有項目、部門、狀態）
├── package.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── jsconfig.json
```

## 本地開發

```bash
# 1. 安裝套件
npm install

# 2. 啟動開發伺服器
npm run dev

# 開啟 http://localhost:3000
```

## 建置（驗證可部署）

```bash
npm run build
npm run start
```

## 部署到 Vercel

### 方式 A：Vercel CLI（最快）

```bash
npm i -g vercel
vercel login
cd D:\AI-center藍圖系統
vercel            # 首次部署（預覽環境）
vercel --prod     # 部署到正式環境
```

### 方式 B：透過 GitHub + Vercel Dashboard（推薦給團隊協作）

1. 在 GitHub 建立一個 repo（例如 `ai-center-blueprint`）。
2. 將本專案 push 上去：
   ```bash
   cd D:\AI-center藍圖系統
   git init
   git add .
   git commit -m "init: AI 中心開發藍圖 Dashboard"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/ai-center-blueprint.git
   git push -u origin main
   ```
3. 到 https://vercel.com → **Add New → Project** → 連結 GitHub repo。
4. Framework Preset 會自動偵測為 **Next.js**，直接按 **Deploy** 即可。
5. 之後每次 push 到 main 分支，Vercel 會自動重新部署。

## 如何更新項目資料

所有項目資料集中在 [`data/projects.js`](./data/projects.js)，每個項目包含以下欄位：

| 欄位 | 說明 |
| --- | --- |
| `id` | 唯一識別碼 |
| `department` | 所屬部門（`評價部` / `管理部`） |
| `name` | 項目名稱 |
| `status` | `STATUS.DONE` 已完成 / `STATUS.IN_PROGRESS` 進行中 / `STATUS.PLANNING` 規劃中 |
| `progress` | 進度百分比 (0~100) |
| `frequency` | 執行頻率（例：每個案件、每月 1 次…） |
| `startDate`, `endDate` | 專案起訖日（可選） |
| `aiDirection` | 希望 AI 改善的方向 |
| `expectedOutput` | 預期輸出成果 |
| `logic` | 任務步驟 / 處理邏輯 |
| `tag` | 分類標籤 |

### 新增部門

目前 `DEPARTMENTS = ['評價部', '管理部']`，之後若有新客戶部門（例如研發部），只需：

1. 修改 `data/projects.js` 最上方的 `DEPARTMENTS` 陣列，加入新部門名稱。
2. 在 `ProjectTable.jsx` 的 `deptStyle` 加入該部門的顏色樣式。
3. 在 `projects` 陣列中新增該部門的項目即可。

## 目前資料摘要

- **評價部**：36 項（3 項已完成 + 33 項待啟動）
  - 已完成：協助台北/台中同仁優化 Wendy、複雜資本結構機器人、蒙地卡羅模擬器
- **管理部**：2 項
  - 已完成：布告欄
  - 進行中：SaaS 系統
