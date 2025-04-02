"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import * as THREE from "three"

function ChenAttractor({ scrollProgress }) {
  const meshRef = useRef()
  const [positions, setPositions] = useState([])

  useEffect(() => {
    const generateAttractor = () => {
      const points = []
      let x = 5
      let y = 10
      let z = 10

      // Chen attractor parameters
      const a = 40
      const b = 3
      const c = 28

      // Time step
      const dt = 0.002

      for (let i = 0; i < 25000; i++) {
        // Chen attractor equations
        const dx = a * (y - x)
        const dy = (c - a) * x - x * z + c * y
        const dz = x * y - b * z

        x += dx * dt
        y += dy * dt
        z += dz * dt

        points.push(new THREE.Vector3(x * 0.1, y * 0.1, z * 0.1)) // Scale down to fit in view
      }
      setPositions(points)
    }

    generateAttractor()
  }, [])

  useFrame((state, delta) => {
    if (meshRef.current && positions.length > 0) {
      const time = state.clock.getElapsedTime()

      // Create multi-scroll effect
      const scrollOffset1 = Math.floor(positions.length * scrollProgress) * 2
      const scrollOffset2 = Math.floor(positions.length * (1 - scrollProgress)) * 3
      const visiblePoints = positions.length * (0.1 + scrollProgress * 0.9)

      // Create two sets of points that scroll in different directions
      const displayedPoints = [
        ...positions.slice(
          scrollOffset1 % positions.length,
          Math.min((scrollOffset1 % positions.length) + visiblePoints / 2, positions.length),
        ),
        ...positions.slice(0, Math.max(0, visiblePoints / 2 - (positions.length - (scrollOffset1 % positions.length)))),
        ...positions.slice(
          scrollOffset2 % positions.length,
          Math.min((scrollOffset2 % positions.length) + visiblePoints / 2, positions.length),
        ),
        ...positions.slice(0, Math.max(0, visiblePoints / 2 - (positions.length - (scrollOffset2 % positions.length)))),
      ]

      meshRef.current.geometry.setFromPoints(displayedPoints)

      // Increased rotation speed (0.1 -> 0.2)
      meshRef.current.rotation.y = time * 0.2
      meshRef.current.rotation.x = time * 0.1

      meshRef.current.scale.setScalar(15 + scrollProgress * 10) // Adjusted scale for Chen attractor
    }
  })

  return (
    <line ref={meshRef}>
      <bufferGeometry />
      <lineBasicMaterial color="#00A5E0" linewidth={1} /> {/* Picton Blue */}
    </line>
  )
}

function Scene({ scrollProgress }) {
  const { camera } = useThree()

  useEffect(() => {
    camera.position.z = 50
  }, [camera])

  return (
    <>
      <ChenAttractor scrollProgress={scrollProgress} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  )
}

export default function Home() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = window.scrollY / totalHeight
      setScrollProgress(progress)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <main className="min-h-screen" style={{ background: "#424874" }}>
      <div className="fixed inset-0 z-0">
        <Canvas>
          <Scene scrollProgress={scrollProgress} />
        </Canvas>
      </div>
      <div className="relative z-10">
        <header className="p-8">
          <h1 className="text-4xl font-bold mb-4 translucent-text">Your Name</h1>
          <p className="text-xl translucent-text">Web Developer & Creative Coder</p>
        </header>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg translucent-container">
            <h2 className="text-3xl font-bold mb-4 translucent-text">About Me</h2>
            <p className="mb-4 translucent-text">
              I'm a passionate web developer with a love for creative coding and data visualization. My work combines
              cutting-edge web technologies with mathematical concepts to create unique and engaging user experiences.
            </p>
            <p className="translucent-text">
              Scroll down to see how the Chen attractor in the background evolves, symbolizing the complexity and beauty
              of the digital world we create.
            </p>
          </div>
        </section>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg translucent-container">
            <h2 className="text-3xl font-bold mb-4 translucent-text">My Projects</h2>
            <ul className="list-disc list-inside">
              <li className="translucent-text">Interactive Data Visualizations</li>
              <li className="translucent-text">Generative Art Installations</li>
              <li className="translucent-text">Web-based 3D Experiences</li>
              <li className="translucent-text">Custom React Components</li>
            </ul>
          </div>
        </section>
        <section className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-2xl p-8 rounded-lg translucent-container">
            <h2 className="text-3xl font-bold mb-4 translucent-text">Contact Me</h2>
            <p className="mb-4 translucent-text">Interested in working together? Feel free to reach out!</p>
            <a href="mailto:your.email@example.com" className="translucent-link hover:underline">
              your.email@example.com
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}

