"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function SideMiniCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const router = useRouter()

  const items = [
    { 
      icon: "code", 
      label: "코딩 테스트",
      path: "/user/coding-test",
      animated: true 
    },
    { 
      icon: "community", 
      label: "개발자 커뮤니티",
      path: "/user/community" 
    },
  ]

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length)
  }

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % items.length)
  }

  const handleItemClick = () => {
    if (items[activeIndex].path) {
      router.push(items[activeIndex].path)
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, x: 60 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <motion.div
      className="rounded-[24px] bg-gray-300 h-[160px] w-[250px] px-8 flex items-center justify-between" 
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      <motion.button
        className="hover:scale-110 transition duration-200"
        whileHover={{ scale: 1.1 }}
        onClick={handlePrev}
        aria-label="이전 항목"
      >
        <ChevronLeft size={24} className="text-black"/>
      </motion.button>

      <div 
        className="text-center cursor-pointer"
        onClick={handleItemClick}
      >
        <div className="mx-auto mb-2 w-10 h-10 flex items-center justify-center">
          {activeIndex === 0 && (
            // 코딩 테스트 아이콘 - 애니메이션 코드 효과
            <div className="relative w-full h-full">
              <motion.div
                animate={{
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 12H32V28H8V12Z" stroke="black" strokeWidth="2"/>
                  <motion.path 
                    d="M12 16L16 20L12 24" 
                    stroke="black" 
                    strokeWidth="2"
                    animate={{
                      pathLength: [0, 1, 1, 0],
                      opacity: [0, 1, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      times: [0, 0.3, 0.7, 1]
                    }}
                  />
                  <motion.rect 
                    x="18" 
                    y="23" 
                    width="8" 
                    height="2" 
                    fill="black"
                    animate={{
                      opacity: [0, 0, 1, 1, 0],
                      scaleX: [0, 0, 1, 1, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      times: [0, 0.3, 0.5, 0.7, 1]
                    }}
                  />
                </svg>
              </motion.div>
            </div>
          )}
          {activeIndex === 1 && (
            // 개발자 커뮤니티 아이콘
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="14" r="6" stroke="black" strokeWidth="2"/>
              <path d="M10 30C10 24.4772 14.4772 20 20 20C25.5228 20 30 24.4772 30 30" stroke="black" strokeWidth="2"/>
              <circle cx="32" cy="18" r="4" stroke="black" strokeWidth="2"/>
              <path d="M30 28C30 25.2386 32.2386 23 35 23" stroke="black" strokeWidth="2"/>
              <circle cx="8" cy="18" r="4" stroke="black" strokeWidth="2"/>
              <path d="M10 28C10 25.2386 7.76142 23 5 23" stroke="black" strokeWidth="2"/>
            </svg>
          )}
        </div>
        <p className="font-semibold text-black">{items[activeIndex].label}</p>
      </div>

      <motion.button
        className="hover:scale-110 transition duration-200"
        whileHover={{ scale: 1.1 }}
        onClick={handleNext}
        aria-label="다음 항목"
      >
        <ChevronRight size={24} className="text-black" />
      </motion.button>
    </motion.div>
  )
}