'use client';
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// 1. 恒星（太陽）
function Sun({ hp }: { hp: number }) {
  const sunRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (sunRef.current) {
      // 0%ならほぼ停止、それ以外はHPに応じた速度で自転
      const rotSpeed = hp === 0 ? 0.001 : 0.005 * (hp / 100 + 0.2);
      sunRef.current.rotation.y += rotSpeed;
    }
  });

  return (
    <mesh ref={sunRef}>
      <sphereGeometry args={[1.8, 64, 64]} />
      <meshStandardMaterial 
        color={hp === 0 ? "#111" : "#ff4400"} 
        emissive={hp === 0 ? "#220000" : "#ffaa00"} 
        emissiveIntensity={hp === 0 ? 0.5 : 2 * (hp / 100)} 
        wireframe={hp === 0} // 0%で太陽もひび割れる
      />
    </mesh>
  );
}

// 2. 惑星（自然な揺らぎと0%時のひび割れ）
function Planet({ distance, speed, size, color, hp, offset, orbitRotation }: 
  { distance: number, speed: number, size: number, color: string, hp: number, offset: number, orbitRotation: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // --- 速度の設定 ---
    // 0%なら極低速(0.05倍)、HPが低いほど不安定に少し速くなるが、基本はゆったり
    const baseSpeedFactor = hp === 0 ? 0.05 : (1.2 - hp / 100); 
    const t = time * speed * baseSpeedFactor + offset;

    // --- 自然な不安定さ（距離の伸び縮み） ---
    // HPが減るほど、大きくゆっくりと距離が変化する（フラフラ漂う）
    const driftRange = (100 - hp) / 50; 
    const currentDistance = distance + Math.sin(time * 0.5) * driftRange;

    // 軌道計算（楕円っぽさを出すために少し比率を変える）
    meshRef.current.position.x = Math.cos(t) * currentDistance * 1.2;
    meshRef.current.position.z = Math.sin(t) * currentDistance;
    
    // HP減少時の「軌道の上下のズレ」
    meshRef.current.position.y = Math.cos(t * 0.5) * driftRange;
  });

  return (
    <group rotation={orbitRotation}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={hp === 0 ? "#444" : color} 
          emissive={hp === 0 ? "#000" : color}
          emissiveIntensity={hp / 200}
          wireframe={hp === 0} // 0%でひび割れ演出
        />
      </mesh>
    </group>
  );
}

// 3. 全体
export default function HPModel({ hp = 100 }) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ 
          position: [0, 2, 18], // 少し斜め上から見ることで立体感を出す
          fov: 35 
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={hp === 0 ? 0.2 : 0.5} />
        <pointLight position={[0, 0, 0]} intensity={hp === 0 ? 5 : 100} color="#ffaa00" />

        <group>
          <Sun hp={hp} />
          
          {/* 惑星1: 右上がりの斜め軌道 */}
          <Planet 
            distance={6} 
            speed={0.4} 
            size={0.5} 
            color="#00d9ff" 
            hp={hp} 
            offset={0} 
            // X軸とZ軸を両方傾けることで、真上からの視点を完全に排除
            orbitRotation={[Math.PI / 4, 0, Math.PI / 6]} 
          />

          {/* 惑星2: 左上がりの斜め軌道 */}
          <Planet 
            distance={6} 
            speed={0.4} 
            size={0.5} 
            color="#ff00aa" 
            hp={hp} 
            offset={Math.PI} // 反対側から
            orbitRotation={[-Math.PI / 4, 0, -Math.PI / 6]} 
          />
        </group>

        {/* ユーザー操作を制限（完全に固定してX字を維持） */}
        <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}