// app/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        {/* --- ヘッダー部分 --- */}
        <header style={{
          display: 'flex',           // 横並びにする魔法
          justifyContent: 'space-between', // 両端に広げる（左にアイコン、右にボタン）
          alignItems: 'center',      // 上下の中央に揃える
          padding: '10px 40px',      // 内側の余白
          backgroundColor: '#f8f9fa', // 薄いグレーの背景
          borderBottom: '1px solid #ddd' // 下線
        }}>
          {/*後でpublicフォルダに画像を置いて<div>の中身を書き換える予定*/
          /*import Image from 'next/image'

            // ...
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Image src="/logo.png" alt="Logo" width={40} height={40} />
              <span style={{ marginLeft: '10px' }}>サービス名</span>
            </div> */
          }
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            🫠 TRI-KNOT
          </div>

          {/* 右側：ログインボタン */}
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            ログイン
          </button>
        </header>

        {/* --- ページごとのメインコンテンツ（page.tsx の中身） --- */}
        <main>{children}</main>
        
        {/* --- フッター部分 --- */}
        <footer style={{
          padding: '20px',
          backgroundColor: '#333',
          color: 'white',
          textAlign: 'center',
          fontSize: '0.8rem'
        }}>
          <p>TRI-KNOT -- 三日坊主を打ち破る、3人連帯責任フィットネス</p>
          <div style={{ marginTop: '10px' }}>
            {/* <a href="/privacy" style={{ color: '#ccc', marginRight: '15px', textDecoration: 'none' }}>プライバシーポリシー</a>
            <a href="/contact" style={{ color: '#ccc', textDecoration: 'none' }}>お問い合わせ</a> */}
          </div>
        </footer>

      </body>
    </html>
  )
}