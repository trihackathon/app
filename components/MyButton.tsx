// 1. どんなデータを受け取るか「型」を決める
type Props = {
  text: string;           // ボタンに表示する文字
  color?: string;         // 背景色（? をつけると「あってもなくても良い」になる）
  onClick: () => void;    // クリックした時の動き
};

// 2. 部品本体を定義する
export default function MyButton({ text, color = '#ff4500', onClick }: Props) {
  return (
    <button 
      onClick={onClick}
      style={{
        backgroundColor: color,
        color: 'white',
        padding: '10px 20px',
        borderRadius: '5px',
        border: 'none',
        cursor: 'pointer',
        margin: '5px'
      }}
    >
      {text}
    </button>
  );
}