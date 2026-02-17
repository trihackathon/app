import React from 'react';
import { LucideIcon } from 'lucide-react'; // アイコン用の型をインポート
// 1. 型定義: どんな情報を受け取るか決める
type Props = {
  number: number;
  icon: React.ReactNode; // Reactの部品を受け取れるようにする
  title: string;       // カードの見出し
  description: string; // カードの説明文
  bgColor?: string;    // 背景色（任意）
  iconColor?: string; // アイコンの色（任意）
};

// 2. 部品本体
export default function MyCard({ number, icon, title, description, bgColor = '#fff', iconColor = '#992900' }: Props) {
  return (
    <div style={{
      backgroundColor: bgColor,
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column', // 全体を縦に並べる
      gap: '12px',            // 各段（行）の隙間
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      width: '300px',           // 320px から 300px に落とすと並びやすくなります
      minWidth: '250px',        // 最小幅を決めておくと崩れにくいです
      flex: '1 1 300px',        // 「空きスペースがあれば広がるが、基本は300px」という指定
      
    }}>
      {/* 1段目：アイコンと番号（横並び） */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'row', 
        alignItems: 'center', 
        gap: '8px' 
      }}>
        <span style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          color: '#8b0000',
        //   letterSpacing: '0.1em'
        transform: 'translateY(-2px)' // ここで高さを微調整！
        }}>
          {number.toString().padStart(2, '0')}
        </span>
        <div style={{ color: iconColor }}>
          {icon}
        </div>
        
      </div>

      {/* 2段目：タイトル */}
      <h3 style={{ 
        margin: 0, 
        fontSize: '1.2rem', 
        fontWeight: 'bold',
        color: 'white' 
      }}>
        {title}
      </h3>

      {/* 3段目：説明文 */}
      <p style={{ 
        margin: 0, 
        fontSize: '0.9rem', 
        color: '#4b5563', 
        lineHeight: '1.6' 
      }}>
        {description}
      </p>
    </div> // ← ここでしっかり閉じることでエラーが消えます！
  );
}