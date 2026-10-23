"use client";

import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

type TouchControllerState = {
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  ambientRotX: number;
  ambientRotY: number;
  tiltX: number;
  tiltY: number;
};

interface CosmicSpacetimeSceneProps {
  mobile: boolean;
  touchRef: React.MutableRefObject<TouchControllerState>;
}

// ─── 1. Spacetime Curvature Warp Grid ─────────────────────────────────────────
function SpacetimeWarpGrid({
  mobile,
  touchRef,
}: {
  mobile: boolean;
  touchRef: React.MutableRefObject<TouchControllerState>;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);

  // Grid dimensions & resolution tailored for mobile and desktop performance
  const [cols, rows] = mobile ? [44, 32] : [64, 46];
  const [width, height] = mobile ? [13, 9] : [16, 11];

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(width, height, cols, rows);
    return geo;
  }, [width, height, cols, rows]);

  // Crest line geometry representing the top curved horizon of the warp grid
  const { crestGeometry, crestLine } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let c = 0; c <= cols; c++) {
      pts.push(new THREE.Vector3());
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
    const lineMat = new THREE.LineBasicMaterial({
      color: "#67e8f9",
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    return { crestGeometry: lineGeo, crestLine: line };
  }, [cols]);

  useFrame(({ mouse, clock }, delta) => {
    const time = clock.getElapsedTime();
    const pos = geometry.attributes.position;
    const crestPos = crestGeometry.attributes.position;

    // Pointer target in local grid space
    const targetMouseX = mobile ? touchRef.current.tiltX * 3.5 : mouse.x * 4.5;
    const targetMouseY = mobile ? touchRef.current.tiltY * 2.5 : mouse.y * 3.0;

    let crestIdx = 0;

    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const i = r * (cols + 1) + c;
        const x = pos.getX(i);
        const y = pos.getY(i);

        // 1. Primary Gravitational Trough: deep valley in center, sweeping peaks on left & right
        const nx = x / (width * 0.44);
        const ny = y / (height * 0.48);
        let z = (nx * nx * 2.45) - 0.72 + (ny * 0.42);

        // 2. Cosmic undulating wave harmonics (spacetime ripple interference)
        const wave1 = Math.sin(x * 0.88 + time * 1.35) * 0.28 * Math.cos(y * 0.72 + time * 0.65);
        const wave2 = Math.sin((x + y) * 1.15 - time * 0.9) * 0.16;
        const wave3 = Math.cos(x * 1.65 + time * 0.8) * 0.1;

        // 3. Interactive gravitational depression beneath cursor / touch
        const dx = x - targetMouseX;
        const dy = y - targetMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let ripple = 0;
        if (dist < 3.8) {
          ripple = Math.sin(dist * 2.6 - time * 3.0) * Math.exp(-dist * 0.85) * 0.32;
        }

        const finalZ = z + wave1 + wave2 + wave3 + ripple;
        pos.setZ(i, finalZ);

        // Capture highest wave row for the glowing crest silhouette line
        if (r === rows) {
          crestPos.setXYZ(crestIdx, x, y, finalZ + 0.02);
          crestIdx++;
        }
      }
    }

    pos.needsUpdate = true;
    crestPos.needsUpdate = true;
  });

  return (
    <group
      position={[0, mobile ? -1.15 : -1.25, -0.2]}
      rotation={[-1.24, 0, 0]}
    >
      {/* Translucent dark-matter cosmic surface */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          color="#020817"
          roughness={0.4}
          metalness={0.7}
          transparent
          opacity={0.82}
          depthWrite={false}
        />
      </mesh>

      {/* Radiant Electric-Cyan Wireframe Grid */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          color="#00e5ff"
          wireframe
          transparent
          opacity={mobile ? 0.62 : 0.68}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Luminous Pulsar Star Nodes at Grid Intersections */}
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial
          color="#38bdf8"
          size={mobile ? 0.048 : 0.058}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Ultra-luminous Crest Rim Contour */}
      <primitive object={crestLine} />
    </group>
  );
}

// ─── 2. Celestial Crescent Planet & Atmospheric Rim ───────────────────────────
function CelestialPlanet({ mobile }: { mobile: boolean }) {
  const planetRef = useRef<THREE.Mesh>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  const radius = mobile ? 0.95 : 1.25;
  const position: [number, number, number] = mobile
    ? [1.25, 1.55, -1.4]
    : [2.15, 1.45, -1.2];

  useFrame((_, delta) => {
    if (planetRef.current) {
      planetRef.current.rotation.y += delta * 0.035;
      planetRef.current.rotation.x += delta * 0.015;
    }
  });

  return (
    <group position={position}>
      {/* Direct celestial rim light shining from top-left */}
      <pointLight position={[-1.8, 1.2, 1.5]} intensity={4.5} color="#00f0ff" distance={8} />
      <pointLight position={[0.2, 2.0, 0.8]} intensity={3.0} color="#38bdf8" distance={6} />

      {/* Dark Planet Body with Crescent Illumination */}
      <mesh ref={planetRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color="#030816"
          roughness={0.7}
          metalness={0.4}
        />
      </mesh>

      {/* Atmospheric Luminous Crescent Halo Ring */}
      <mesh ref={haloRef} scale={1.035}>
        <sphereGeometry args={[radius, 36, 36]} />
        <meshBasicMaterial
          color="#00f0ff"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer Soft Ethereal Glow */}
      <mesh scale={1.08}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#0ea5e9"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  );
}

// ─── 3. Smaller Satellite Moons ───────────────────────────────────────────────
function SatelliteMoons({ mobile }: { mobile: boolean }) {
  const moon1Ref = useRef<THREE.Mesh>(null);
  const moon2Ref = useRef<THREE.Mesh>(null);
  const moon3Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * 0.2;
    if (moon1Ref.current) {
      moon1Ref.current.position.y = 0.85 + Math.sin(t * 0.8) * 0.08;
    }
    if (moon2Ref.current) {
      moon2Ref.current.position.y = 0.72 + Math.cos(t * 1.1) * 0.06;
    }
    if (moon3Ref.current) {
      moon3Ref.current.position.y = 0.3 + Math.sin(t * 0.9) * 0.05;
    }
  });

  return (
    <>
      {/* Moon 1: Medium crescent planet on the upper-left */}
      <group position={mobile ? [-1.3, 0.8, -1.6] : [-1.55, 0.9, -1.4]}>
        <pointLight position={[-0.4, 0.4, 0.6]} intensity={1.8} color="#00f0ff" distance={3} />
        <mesh ref={moon1Ref}>
          <sphereGeometry args={[mobile ? 0.18 : 0.24, 32, 32]} />
          <meshStandardMaterial color="#040d1e" roughness={0.6} metalness={0.5} />
        </mesh>
        <mesh scale={1.08}>
          <sphereGeometry args={[mobile ? 0.18 : 0.24, 24, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.25} blending={THREE.AdditiveBlending} side={THREE.BackSide} />
        </mesh>
      </group>

      {/* Moon 2: Small distant satellite near center-right */}
      <group position={mobile ? [0.45, 0.7, -1.5] : [0.65, 0.75, -1.3]}>
        <mesh ref={moon2Ref}>
          <sphereGeometry args={[mobile ? 0.07 : 0.09, 20, 20]} />
          <meshStandardMaterial color="#05142b" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>

      {/* Moon 3: Tiny celestial node */}
      <group position={mobile ? [1.1, 0.32, -1.3] : [1.35, 0.35, -1.1]}>
        <mesh ref={moon3Ref}>
          <sphereGeometry args={[mobile ? 0.06 : 0.075, 20, 20]} />
          <meshStandardMaterial color="#071b38" roughness={0.5} metalness={0.6} />
        </mesh>
      </group>
    </>
  );
}

// ─── 4. Sweeping Orbital Trajectories with Traveling Pulsar Nodes ─────────────
function OrbitalTrajectories({ mobile }: { mobile: boolean }) {
  const satellite1 = useRef<THREE.Mesh>(null);
  const satellite2 = useRef<THREE.Mesh>(null);
  const satellite3 = useRef<THREE.Mesh>(null);

  // Generate 3 concentric elliptical orbital curves arcing across the sky
  const { curve1, curve2, curve3, line1, line2, line3 } = useMemo(() => {
    const cx = mobile ? 1.25 : 2.15;
    const cy = mobile ? 1.55 : 1.45;

    const c1 = new THREE.EllipseCurve(
      cx,
      cy,
      mobile ? 2.6 : 3.4,
      mobile ? 1.7 : 2.2,
      Math.PI * 0.65,
      Math.PI * 1.82,
      false,
      -0.34
    );
    const c2 = new THREE.EllipseCurve(
      cx,
      cy,
      mobile ? 3.3 : 4.4,
      mobile ? 2.2 : 2.9,
      Math.PI * 0.7,
      Math.PI * 1.78,
      false,
      -0.37
    );
    const c3 = new THREE.EllipseCurve(
      cx,
      cy,
      mobile ? 4.1 : 5.4,
      mobile ? 2.7 : 3.6,
      Math.PI * 0.74,
      Math.PI * 1.72,
      false,
      -0.4
    );

    const pts1 = c1.getPoints(70).map((p) => new THREE.Vector3(p.x, p.y, -1.2));
    const pts2 = c2.getPoints(80).map((p) => new THREE.Vector3(p.x, p.y, -1.3));
    const pts3 = c3.getPoints(90).map((p) => new THREE.Vector3(p.x, p.y, -1.4));

    const line1 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts1),
      new THREE.LineBasicMaterial({ color: "#00d4ff", transparent: true, opacity: 0.34, blending: THREE.AdditiveBlending })
    );
    const line2 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts2),
      new THREE.LineBasicMaterial({ color: "#00e5ff", transparent: true, opacity: 0.28, blending: THREE.AdditiveBlending })
    );
    const line3 = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(pts3),
      new THREE.LineBasicMaterial({ color: "#38bdf8", transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending })
    );

    return {
      curve1: c1,
      curve2: c2,
      curve3: c3,
      line1,
      line2,
      line3,
    };
  }, [mobile]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Satellite 1 along inner orbit
    if (satellite1.current) {
      const progress1 = ((t * 0.055) + 0.35) % 1;
      const pt1 = curve1.getPoint(progress1);
      satellite1.current.position.set(pt1.x, pt1.y, -1.2);
    }

    // Satellite 2 along middle orbit
    if (satellite2.current) {
      const progress2 = ((t * 0.042) + 0.65) % 1;
      const pt2 = curve2.getPoint(progress2);
      satellite2.current.position.set(pt2.x, pt2.y, -1.3);
    }

    // Satellite 3 along outer orbit
    if (satellite3.current) {
      const progress3 = ((t * 0.032) + 0.12) % 1;
      const pt3 = curve3.getPoint(progress3);
      satellite3.current.position.set(pt3.x, pt3.y, -1.4);
    }
  });

  return (
    <group>
      {/* Orbital Arc Lines */}
      <primitive object={line1} />
      <primitive object={line2} />
      <primitive object={line3} />

      {/* Orbiting Pulsar Node 1 */}
      <mesh ref={satellite1}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>
      {/* Halo for Node 1 */}
      <pointLight position={[0, 0, 0]} intensity={1.5} color="#00f0ff" distance={2} />

      {/* Orbiting Pulsar Node 2 */}
      <mesh ref={satellite2}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" />
      </mesh>

      {/* Orbiting Pulsar Node 3 */}
      <mesh ref={satellite3}>
        <sphereGeometry args={[0.042, 16, 16]} />
        <meshBasicMaterial color="#67e8f9" />
      </mesh>
    </group>
  );
}

// ─── 5. Deep Space Dust & Starfield ───────────────────────────────────────────
function CosmicStarfield({
  mobile,
  touchRef,
}: {
  mobile: boolean;
  touchRef: React.MutableRefObject<TouchControllerState>;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = mobile ? 380 : 750;

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const cyan = new THREE.Color("#00f0ff");
    const lightBlue = new THREE.Color("#38bdf8");
    const white = new THREE.Color("#ffffff");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 11;
      pos[i * 3 + 2] = -1.0 - Math.random() * 5.0;

      // Color variation: mostly cyan/electric blue, some twinkling white
      const r = Math.random();
      const chosenColor = r < 0.55 ? cyan : r < 0.85 ? lightBlue : white;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return { positions: pos, colors: col };
  }, [count]);

  const starGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, [positions, colors]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    // Slow drift & parallax response
    pointsRef.current.rotation.y += delta * 0.02;
    pointsRef.current.rotation.x += delta * 0.008;

    const targetX = touchRef.current.tiltY * 0.15;
    const targetY = touchRef.current.tiltX * 0.15;
    pointsRef.current.rotation.x += (targetX - pointsRef.current.rotation.x) * 0.05;
    pointsRef.current.rotation.y += (targetY - pointsRef.current.rotation.y) * 0.05;
  });

  return (
    <points ref={pointsRef} geometry={starGeo}>
      <pointsMaterial
        size={mobile ? 0.042 : 0.05}
        vertexColors
        transparent
        opacity={0.88}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// ─── Main Cosmic Spacetime Scene Export ───────────────────────────────────────
export default function CosmicSpacetimeScene({
  mobile,
  touchRef,
}: CosmicSpacetimeSceneProps) {
  const rootRef = useRef<THREE.Group>(null);
  const width = useThree((s) => s.size.width);

  // Responsive scale factor
  const sceneScale = width < 480 ? 0.72 : width < 768 ? 0.82 : width < 1024 ? 0.92 : 1;

  useFrame(({ mouse }) => {
    if (!rootRef.current) return;

    // Smooth subtle parallax response for the entire cosmic composition
    const targetParallaxX = (mobile ? touchRef.current.tiltY * 0.28 : -mouse.y * 0.18) + (touchRef.current.rotX * 0.04);
    const targetParallaxY = (mobile ? touchRef.current.tiltX * 0.28 : mouse.x * 0.18) + (touchRef.current.rotY * 0.04);

    rootRef.current.rotation.x += (targetParallaxX - rootRef.current.rotation.x) * 0.06;
    rootRef.current.rotation.y += (targetParallaxY - rootRef.current.rotation.y) * 0.06;
  });

  return (
    <group ref={rootRef} scale={sceneScale}>
      {/* Ambient Cosmos Lighting */}
      <ambientLight intensity={0.65} color="#0b1736" />
      <directionalLight position={[0, 4, 3]} intensity={1.2} color="#38bdf8" />

      {/* 1. Deep Space Starfield & Cosmic Dust */}
      <CosmicStarfield mobile={mobile} touchRef={touchRef} />

      {/* 2. Sweeping Concentric Orbital Rings & Traveling Satellites */}
      <OrbitalTrajectories mobile={mobile} />

      {/* 3. Celestial Crescent Planet (Upper Right) */}
      <CelestialPlanet mobile={mobile} />

      {/* 4. Satellite Moons orbiting in space */}
      <SatelliteMoons mobile={mobile} />

      {/* 5. Center-Stage Spacetime Gravitational Curvature Warp Grid */}
      <SpacetimeWarpGrid mobile={mobile} touchRef={touchRef} />
    </group>
  );
}
