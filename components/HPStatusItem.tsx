// components/HPStatusItem.tsx
import React from 'react';
import Image from 'next/image';

type Props = {
  stage: string;       // 状態名（例：「健全」「警告」など）
  hpRange: string;     // HPの範囲（例：「100-75%」）
  imageSrc: React.ReactNode; // [修正] string から React.ReactNode に変更
  description: string; // 短い説明
  color: string;       // 状態を表す色
};

export default function HPStatusItem({ stage, hpRange, imageSrc, description, color }: Props) {
  return (
    <div style={{ flex: 1, textAlign: 'center', padding: '10px' }}>
      {/* 画像/3Dモデルを表示するエリア */}
      <div style={{
        width: '100px', // 3Dモデルが見えやすいよう少し大きく調整
        height: '100px',
        margin: '0 auto 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {/* [修正] <img> タグではなく、直接中身を表示するように変更 */}
        {imageSrc}
      </div>

      <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: color }}>
        {stage} ({hpRange})
      </div>
      <p style={{ fontSize: '0.75rem', color: '#666', margin: 0 }}>
        {description}
      </p>
    </div>
  );
}