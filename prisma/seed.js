// Prisma seed: 部門 + Excel 藍圖 39 項
// 執行：npx prisma db seed  (或 node prisma/seed.js)
// 重複執行安全：使用 upsert，以 code 為 unique key

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEPTS = [
  { code: 'valuation',  name: '評價部', sortOrder: 1 },
  { code: 'management', name: '管理部', sortOrder: 2 },
];

// 注意：Excel 藍圖 39 項，status: done / in_progress / planning
const PROJECTS = [
  // 已完成 (3 + 1 = 4)
  { code:'val-wendy-optimization', dept:'valuation', name:'協助台北、台中同仁優化 Wendy', status:'done', tag:'同仁協作', frequency:'專案性', plannedStart:'2026-04-21', plannedEnd:'2026-04-24', aiDirection:'協助台北、台中同仁優化 Wendy 相關功能，提升使用效率。', expectedOutput:'優化後的 Wendy 功能，解決同仁使用痛點。', logic:'現場協助 + 需求盤點 + 功能調整' },
  { code:'val-complex-capital-bot', dept:'valuation', name:'複雜資本結構機器人', status:'done', tag:'機器人', frequency:'按需要', aiDirection:'自動處理複雜資本結構計算，減少人工作業時間。', expectedOutput:'自動化計算複雜資本結構，輸出報告書所需表格。', logic:'自動化資本結構判斷 → 參數計算 → 報表產出' },
  { code:'val-monte-carlo-simulator', dept:'valuation', name:'蒙地卡羅模擬器', status:'done', tag:'機器人', frequency:'按需要', aiDirection:'透過蒙地卡羅模擬進行機率性評價分析。', expectedOutput:'蒙地卡羅模擬計算結果、敵感度分析圖表。', logic:'輸入參數 → 隨機模擬 → 統計分析 → 產出結果' },
  { code:'val-01', dept:'valuation', name:'標的公司介紹資料', status:'planning', tag:'標的公司', frequency:'每個案件', aiDirection:'', expectedOutput:'', logic:'' },
  { code:'val-02', dept:'valuation', name:'商工登記資料', status:'planning', tag:'標的公司', frequency:'每個案件', aiDirection:'', expectedOutput:'', logic:'' },
  { code:'val-03', dept:'valuation', name:'DQ 清單回復文字、營運計劃書閱讀', status:'planning', tag:'資料閱讀', frequency:'每個案件', aiDirection:'', expectedOutput:'', logic:'' },
  { code:'val-04', dept:'valuation', name:'標的財務報表 Key in', status:'planning', tag:'財務報表', frequency:'每個案件', aiDirection:'不用再去識別化。', expectedOutput:'', logic:'' },
  { code:'val-05', dept:'valuation', name:'財產清冊整理計算折舊費用（Excel 來源）', status:'planning', tag:'折舊攝銷', frequency:'每個案件', aiDirection:'', expectedOutput:'', logic:'' },
  { code:'val-05b', dept:'valuation', name:'財產清冊整理計算折舊費用（PDF 來源）', status:'planning', tag:'折舊攝銷', frequency:'每個案件', aiDirection:'', expectedOutput:'', logic:'' },
  { code:'val-06', dept:'valuation', name:'客戶關係流失率計算', status:'planning', tag:'客戶分析', frequency:'每個案件', aiDirection:'客戶名單 Excel，自動計算各期流失率。', expectedOutput:'年度流失率表及計算平均值。', logic:'Excel 簡單處理計算，不含參數判斷屬 input 端。' },
  { code:'val-07', dept:'valuation', name:'會議記錄', status:'planning', tag:'會議', frequency:'每次會議', aiDirection:'錄音檔轉逪字稿及整理摘要，並自動匯入歷史的會議紀錄檔案。', expectedOutput:'問答功能。', logic:'' },
  { code:'val-08', dept:'valuation', name:'重要合約基本資料表', status:'planning', tag:'合約', frequency:'按需要', aiDirection:'請未來巢提供 XERNO 適合的 Prompt。', expectedOutput:'', logic:'定義現有欄位 → AI 抓取 → 後續擴充。' },
  { code:'val-09', dept:'valuation', name:'特別股條款', status:'planning', tag:'合約', frequency:'按需要', aiDirection:'請未來巢提供 XERNO 適合的 Prompt。', expectedOutput:'', logic:'定義現有欄位 → AI 抓取 → 後續擴充。' },
  { code:'val-10', dept:'valuation', name:'風險評估（法律/帳務/環保/營運）', status:'planning', tag:'風險評估', frequency:'每個案件', aiDirection:'生成之報告書自動匯入 XERNO / NAS。', expectedOutput:'問答功能。', logic:'' },
  { code:'val-11', dept:'valuation', name:'專利權、商標權、許可證清單', status:'planning', tag:'無形資產', frequency:'每個案件', aiDirection:'公司名稱查找所有無形資產清單，並自動匯入指定資料夾。', expectedOutput:'各項無形資產原始檔案、報告書用表格。', logic:'網站爬蟲 + 格式化。' },
  { code:'val-12', dept:'valuation', name:'科目餘額明細表（長投、非營運性資產負債）', status:'planning', tag:'財務報表', frequency:'按需要', aiDirection:'客戶提供之資料轉 Excel，並自動核對大表金額相符。', expectedOutput:'Excel 明細表，並顯示與大表相符之字樣。', logic:'轉檔機器人處理。' },
  { code:'val-13', dept:'valuation', name:'產業分析資料', status:'planning', tag:'產業分析', frequency:'每個案件', aiDirection:'自動串接標的公司 API，自動化執行並撇取資料。', expectedOutput:'', logic:'' },
  { code:'val-14', dept:'valuation', name:'可類比公司篩選', status:'planning', tag:'市場法', frequency:'每個案件', aiDirection:'自動串接標的公司 API，自動化執行並撇取資料。', expectedOutput:'', logic:'' },
  { code:'val-15', dept:'valuation', name:'華淵歷史案件資料庫', status:'planning', tag:'資料庫', frequency:'按需要', aiDirection:'文管系統列出各產業，彙整合適的比較公司。', expectedOutput:'問答功能。', logic:'UI 介面，限定範圍內查詢。' },
  { code:'val-16', dept:'valuation', name:'Bloomberg 資料抓取', status:'planning', tag:'資料來源', frequency:'每個案件', aiDirection:'', expectedOutput:'自動生成報告書用圖表。', logic:'' },
  { code:'val-17', dept:'valuation', name:'控制權折溢價資料', status:'planning', tag:'評價參數', frequency:'每個案件', aiDirection:'自動串接標的公司 API，自動化執行並撇取資料。', expectedOutput:'', logic:'' },
  { code:'val-18', dept:'valuation', name:'流動性折價資料（Chaffee & Finnerty）', status:'planning', tag:'評價參數', frequency:'按需要', aiDirection:'DLOM 機器人，只需輸入 S、X、T，自動計算 RF 及波動率，篩選出合適的 DLOM 比率。', expectedOutput:'波動率計算表、原始計算過程、報告書用表格。', logic:'爬蟲抓股價 → 計算波動率 → 生成報告書表格。' },
  { code:'val-19', dept:'valuation', name:'WACC 驗算', status:'planning', tag:'評價參數', frequency:'每個案件', aiDirection:'要有一支驗算機器人，確保 Wendy 計算結果無誤。', expectedOutput:'顯示驗算結果無誤。', logic:'' },
  { code:'val-20', dept:'valuation', name:'Beta 原始值', status:'planning', tag:'評價參數', frequency:'需要 review 的案件', aiDirection:'自動擷取 BB ticker 畫面，或其他方式，不需要人工透筆抓 Beta 圖檔。', expectedOutput:'Beta 原始資料（供 review 使用）。', logic:'' },
  { code:'val-21', dept:'valuation', name:'股價/財報（週）資料 - 台灣', status:'planning', tag:'爬蟲', frequency:'台灣公司每季 1 次', aiDirection:'爬蟲程式自動啟動。', expectedOutput:'每季財報揭露後，爬蟲程式自動於午夜啟動。', logic:'自動啟動爬蟲程式。' },
  { code:'val-22', dept:'valuation', name:'無風險利率機器人', status:'planning', tag:'爬蟲', frequency:'每月 1 次', aiDirection:'爬蟲程式自動啟動。', expectedOutput:'每月月底，爬蟲程式自動於午夜啟動。', logic:'自動啟動爬蟲程式。' },
  { code:'val-23', dept:'valuation', name:'市場報酬率機器人', status:'planning', tag:'爬蟲', frequency:'每月 1 次', aiDirection:'爬蟲程式自動啟動。', expectedOutput:'每月月底，爬蟲程式自動於午夜啟動。', logic:'自動啟動爬蟲程式。' },
  { code:'val-24', dept:'valuation', name:'國家風險溢酬', status:'planning', tag:'爬蟲', frequency:'每半年 1 次', aiDirection:'爬蟲程式自動啟動。', expectedOutput:'1/5、7/5，爬蟲程式自動於午夜啟動。', logic:'自動啟動爬蟲程式。' },
  { code:'val-25', dept:'valuation', name:'稅率 - OECD', status:'planning', tag:'爬蟲', frequency:'每年 1 次', aiDirection:'製作爬蟲程式，每年自動撇取稅率。', expectedOutput:'每年年底自動於午夜啟動。', logic:'爬蟲（OECD）。' },
  { code:'val-26', dept:'valuation', name:'基準利率', status:'planning', tag:'爬蟲', frequency:'每月 1 次', aiDirection:'製作爬蟲程式，每月自動撇取借款利率。', expectedOutput:'每月月底自動於午夜啟動。', logic:'爬蟲（同無風險利率小程式）。' },
  { code:'val-27', dept:'valuation', name:'評價基準日匯率', status:'planning', tag:'爬蟲', frequency:'每月 1 次', aiDirection:'製作爬蟲程式，每月自動撇取匯率。', expectedOutput:'每月月底自動於午夜啟動。', logic:'爬蟲（台灣用中央銀行；中國用外管局、人民銀行）。' },
  { code:'val-28', dept:'valuation', name:'市場授權金資料', status:'planning', tag:'無形資產', frequency:'每技術 / 商標 / PPA 案', aiDirection:'1. 文管系統列出各產業。 2. 上 ktmine 運用關鍵字抓取所有資料進系統。', expectedOutput:'1. 問答功能。 2. 報告書用表格、計算檔用表格。', logic:'UI 介面，限定範圍內查詢。' },
  { code:'val-29', dept:'valuation', name:'經濟年限', status:'planning', tag:'無形資產', frequency:'每技術 / PPA 案', aiDirection:'1. 文管系統列出各產業合適的併購年限。 2. 針對台灣/美國 SEC Filing，運用爬蟲及 OCR。', expectedOutput:'1. 問答功能。 2. 報告書用表格、計算檔用表格。', logic:'UI 介面，限定範圍內查詢。' },
  { code:'val-30', dept:'valuation', name:'股票成交量周轉率', status:'planning', tag:'評價參數', frequency:'興櫃 / 低成交量案', aiDirection:'製作成交量周轉率機器人。', expectedOutput:'股票成交量周轉率計算表、是否符合標準之判定結果。', logic:'公開資訊站、goodinfo!、Yahoo Finance 交叉驗證。' },
  { code:'val-31', dept:'valuation', name:'計算檔核對', status:'planning', tag:'檔案核對', frequency:'每個案件', aiDirection:'針對跨檔案進行核對。', expectedOutput:'輸出差異點報告（詳細列出兩個檔案之間的不同）。', logic:'' },
  { code:'val-32', dept:'valuation', name:'底稿製作', status:'planning', tag:'文件產出', frequency:'每個案件（需要 Review）', aiDirection:'底稿機器人（自動抓取母檔製作底稿）。', expectedOutput:'底稿（For Review 用）。', logic:'' },
  { code:'val-33', dept:'valuation', name:'報告書附件製作', status:'planning', tag:'文件產出', frequency:'每個案件', aiDirection:'報告書附件機器人（自動抓取母檔製作報告書附件）。', expectedOutput:'報告書附件（For 各報告書使用）。', logic:'' },
  // 管理部
  { code:'mgmt-saas-system', dept:'management', name:'SaaS 系統', status:'in_progress', tag:'系統導入', frequency:'長期專案', aiDirection:'導入 SaaS 系統改善管理流程，提升內部協作效率。', expectedOutput:'SaaS 系統上線運作，整合現有管理流程。', logic:'需求盤點 → 系統選型 → 導入建置 → 教育訓練 → 上線', manualProgress:50 },
  { code:'mgmt-bulletin-board', dept:'management', name:'布告欄', status:'done', tag:'內部工具', frequency:'長期運作', aiDirection:'建置內部公告布告欄系統。', expectedOutput:'上線之布告欄系統。', logic:'需求規劃 → 系統建置 → 內容遷移 → 上線' },
];

async function main() {
  console.log('\n--- Seeding departments ---');
  const deptMap = {};
  for (const d of DEPTS) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, sortOrder: d.sortOrder },
      create: d,
    });
    deptMap[d.code] = dept.id;
    console.log('  ✓', d.code, '->', d.name, '(id=' + dept.id + ')');
  }

  console.log('\n--- Seeding projects (' + PROJECTS.length + ') ---');
  let idx = 0;
  for (const p of PROJECTS) {
    idx++;
    await prisma.project.upsert({
      where: { code: p.code },
      update: {
        name: p.name, status: p.status, tag: p.tag, frequency: p.frequency,
        aiDirection: p.aiDirection, expectedOutput: p.expectedOutput, logic: p.logic,
        manualProgress: p.manualProgress ?? null,
        plannedStart: p.plannedStart ? new Date(p.plannedStart) : null,
        plannedEnd: p.plannedEnd ? new Date(p.plannedEnd) : null,
      },
      create: {
        code: p.code,
        departmentId: deptMap[p.dept],
        name: p.name,
        status: p.status,
        tag: p.tag,
        frequency: p.frequency,
        aiDirection: p.aiDirection,
        expectedOutput: p.expectedOutput,
        logic: p.logic,
        manualProgress: p.manualProgress ?? null,
        plannedStart: p.plannedStart ? new Date(p.plannedStart) : null,
        plannedEnd: p.plannedEnd ? new Date(p.plannedEnd) : null,
        isCustom: false,
        sortOrder: idx,
      },
    });
    process.stdout.write('.');
    if (idx % 10 === 0) process.stdout.write(' ' + idx + '\n');
  }

  const total = await prisma.project.count();
  console.log('\n\n✔ Projects seeded. Total in DB:', total);

  // === 建立 Louis 並指派為全部項目的 owner ===
  console.log('\n--- Seeding default user (Louis) ---');
  const louis = await prisma.user.upsert({
    where: { email: 'IT@wauyuan.com' },
    update: { displayName: 'Louis', title: '財務工程師', role: 'admin' },
    create: {
      email: 'IT@wauyuan.com',
      displayName: 'Louis',
      title: '財務工程師',  // 財務工程師
      role: 'admin',
    },
  });
  console.log('  ✓ Louis (id=' + louis.id + ', title=' + louis.title + ')');

  console.log('\n--- Assigning Louis as owner of all projects ---');
  const allProjects = await prisma.project.findMany({ select: { id: true } });
  let assigned = 0;
  for (const p of allProjects) {
    await prisma.projectOwner.upsert({
      where: { projectId_userId: { projectId: p.id, userId: louis.id } },
      update: { roleInProject: 'owner' },
      create: { projectId: p.id, userId: louis.id, roleInProject: 'owner' },
    });
    assigned++;
  }
  console.log('  ✓ Assigned to ' + assigned + ' projects');

  console.log('\n✔ Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
