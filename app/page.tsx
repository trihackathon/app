// app/page.tsx
'use client'; // ボタンのクリック（動き）を使う場合に必要
import MyButton from '../components/MyButton';
import MyCard from '../components/MyCard';
import { Settings } from 'lucide-react';
import HPStatusItem from '../components/HPStatusItem';
import HPModel from '../components/HPModel';

export default function Home() {

  const viewDemo = () => alert('デモ画面へ遷移');

  return (
    // 1. ページ全体を囲うタグ（mainなど）
    <main style={{ padding: '40px 7%',      // [修正] 上下は40px、左右は画面幅の5%を常に空ける
      maxWidth: '1200px',      // [修正] 800pxから広げて、3枚が収まる余裕を作る
      margin: '0 auto',        // [重要] これで中央寄せになり、両端に大きな余白ができる
      width: '100%',
      boxSizing: 'border-box'  // パディングを含めて幅を計算する設定
    }}>
      
      {/* --- ヒーローセクション：ここを大きく表示 --- */}
      <section style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '10px 0',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '100%',         // 横幅いっぱいを許容
          maxWidth: '600px',     // [調整] 最大で600pxまで広げる
          height: '450px',       // [調整] 高さを出すことで迫力を出します
          marginBottom: '0px',   // 下のタイトルとの隙間を詰める
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* ヒーロー用なので、100%の状態を表示 */}
          <HPModel hp={100} />
        </div>
      </section>

      {/* 2. このページ固有のタイトル */}
      <h1 style={{ fontSize: '2rem', marginBottom: '20px',marginTop: '0px' }}>
        仲間を裏切れないから、続く
      </h1>
      <p>3人一組の連帯責任で、三日坊主を打ち破る。GPS自動検証で嘘をつけない。 仲間の失敗は、全員のダメージ。</p>

      {/* 同じ部品を、違う文字・色・動きで再利用！ */}
      <MyButton 
        text="デモを体験する →" 
        onClick={viewDemo} 
      />

      {/* 3. このページ固有の説明文 */}
      <section style={{ marginBottom: '40px' }}>
        <p>
          ここは私がいま学習しているNext.jsの成果をまとめる場所です。
          まだ作り始めたばかりですが、少しずつ形にしていきます。
        </p>
      </section>

      {/* 4. ここから下は、後で「部品（コンポーネント）」に置き換える予定の場所 */}
      <section>
        <h2 style={{ borderTop: '1px solid #eee' }}>仕組み</h2>
        <p>シンプルだけど逃げられない、3つのステップ</p>
        
      {/* カードを横に並べるコンテナ */}
      <div style={{
        display: 'flex',
        flexWrap: 'nowrap',   // [重要] 'wrap' から 'nowrap' に変更して強制1行に
        gap: '16px',          // 間隔を少し詰めると収まりやすくなります
        justifyContent: 'space-between', // 両端にバランスよく配置
        width: '100%',        // 親の幅いっぱいに広げる
        overflowX: 'auto',    // 万が一画面が狭すぎた場合に横スクロールできるようにする
        padding: '10px 0'
      }}>
        <MyCard 
          number={1}
          icon={<Settings size={32} />}
          title="アイデア出し"
          description="新しいアプリケーションの企画と市場調査を行います。"
          bgColor="#333333"
        />

        <MyCard 
          number={2}
          icon={<Settings size={32} />}
          title="GPSが証明する"
          description="ランニングのGPS軌跡、ジムの滞在時間を自動検証。嘘はつけない。"
          bgColor="#333333"
        />

        <MyCard 
          number={3}
          icon={<Settings size={32} />}
          title="裏切ればHPが減る"
          description="1人の失敗で全員にダメージ。HP0でチーム解散。縄が切れる。"
          bgColor="#333333"
        />
      </div>
      </section>

      <section>
        <h2 style={{ borderTop: '1px solid #eee' }}>縄が切れたら、終わり。</h2>
        <p>HPが減るほど縄がほつれていく</p>
        
        {/* いまは直接書くけれど、後で WelcomeCard.tsx などに差し替える部分 */}
        <section style={{ marginTop: '60px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>HPの変化と縄の状態</h2>
  
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '10px',
            maxWidth: '1000px', // 少し広げても良いかもしれません
            margin: '0 auto'
          }}>
            {/* 各アイテムをラップする関数を作るとスッキリします */}
            {[
              { stage: "健全", hp: 100, range: "100%", color: "#22c55e", desc: "縄は太く、強い。全員が順調。" },
              { stage: "注意", hp: 65, range: "65%", color: "#eab308", desc: "縄が少し毛羽立つ。誰かがサボり気味。" },
              { stage: "危険", hp: 30, range: "30%", color: "#f97316", desc: "縄が細くなり、千切れそう。" },
              { stage: "崩壊", hp: 0, range: "0%", color: "#ef4444", desc: "縄が切れてチーム解散。" },
            ].map((item) => (
              <HPStatusItem 
                key={item.stage}
                stage={item.stage}
                hpRange={item.range}
                imageSrc={
                  /* 【ここがポイント！】
                    HPModelを直接渡すのではなく、サイズ指定用のdivで囲って渡します。
                    これにより、小さなカード内でも適切なサイズ（例: 150px）に収まります。
                  */
                  <div style={{ width: '150px', height: '150px', margin: '0 auto' }}>
                    <HPModel hp={item.hp} />
                  </div>
                }
                description={item.desc}
                color={item.color}
              />
            ))}
          </div>
        </section>
      </section>

      <section>
        <h2 style={{ borderTop: '1px solid #eee' }}>今日から始める</h2>
        <p>3人集まれば、もう逃げられない</p>

        <MyButton 
        text="デモを体験する →" 
        onClick={viewDemo} 
      />
      </section>

    </main>
  );
}