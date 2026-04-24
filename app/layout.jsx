import './globals.css';

export const metadata = {
  title: 'AI 中心 開發藍圖 Dashboard',
  description: '華淵 AI 中心 開發藍圖追蹤儀表板',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-Hant">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@300;400;500;600;700&display=swap"
        />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
