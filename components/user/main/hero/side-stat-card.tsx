"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function SideCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % 2)
    }, 10000) // 3초마다 전환

    return () => clearInterval(timer)
  }, [])

  const variants = {
    enter: { opacity: 1, x: 0 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 1, x: 0 }
  }

  return (
    <div className="relative h-[270px] w-[250px]">
      <AnimatePresence mode="wait">
        {currentIndex === 0 ? (
          <motion.div
            key="stat"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <SideStatCard />
          </motion.div>
        ) : (
          <motion.div
            key="impact"
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5 }}
          >
            <SideImpactCard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 인디케이터 */}
      {/* <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {[0, 1].map((index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              currentIndex === index ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div> */}
    </div>
  )
}

// 숫자 애니메이션 카드
function SideStatCard() {
  const [count, setCount] = useState(0)
  const targetCount = 66609538
  const duration = 1800
  const frameRate = 30
  const totalFrames = Math.floor((duration / 1000) * frameRate)
  const countRef = useRef(null)

  useEffect(() => {
    let frame = 0
    const counter = setInterval(() => {
      frame++
      const progress = frame / totalFrames
      const easedProgress = progress < 0.5 ? 4 * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 3) / 2

      setCount(Math.floor(easedProgress * targetCount))

      if (frame === totalFrames) {
        clearInterval(counter)
        setCount(targetCount)
      }
    }, 1000 / frameRate)

    return () => clearInterval(counter)
  }, [])

  const formatNumber = (num: number) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  }

  return (
    <div className="rounded-[24px] bg-[#B91C1C] h-[270px] w-[250px] pl-6 pt-9 pb-10 flex flex-col justify-between">
      <div>
        <h3 className="text-lg font-bold mb-2 text-white">함께 성장하는</h3>
        <p className="text-sm text-white">전체 사용자 수</p>
      </div>

      <div>
        <p className="text-3xl font-extrabold flex items-baseline text-white" ref={countRef}>
          {formatNumber(count)}
          <span className="text-lg font-normal ml-1">명</span>
        </p>
        <p className="text-sm mt-2 text-white">2024년 4월 현재</p>
      </div>
    </div>
  )
}

// 임팩트 카드
function SideImpactCard() {
  return (
    <div className="rounded-[24px] bg-gradient-to-br from-blue-600 to-indigo-700 h-[270px] w-[250px] p-6 flex flex-col justify-between overflow-hidden relative">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white leading-tight">
          코드로<br/>
          미래를<br/>
          만들어가다
        </h2>
      </div>

      {/* 아이콘 */}
      <div className="relative z-10">
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="text-white text-4xl font-mono opacity-80">
            &lt;/&gt;
          </div>
        </motion.div>
      </div>
    </div>
  )
}