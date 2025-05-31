"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"

export default function SideSlideCard() {
  const [activeSlide, setActiveSlide] = useState<number>(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalSlides = 3

  const slides = [
    {
      title: "전문 강사진과",
      description: "실력있는 강의를",
      tags: "#현직개발자 #대기업출신",
      badge: "강사소개"
    },
    {
      title: "모든 분야의",
      description: "코딩을 배우세요",
      tags: "#프론트엔드 #AI개발",
      badge: "강의소개"
    },
    {
      title: "실무 프로젝트로",
      description: "성장하세요",
      tags: "#실전프로젝트 #포트폴리오",
      badge: "커리큘럼"
    },
  ]

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % totalSlides)
    }, 3500)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

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
      className="rounded-[24px] bg-[#1A1A1A] h-[260px] w-[250px] p-6 text-white relative"
      variants={cardVariants}
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
    >
      {/* 상단 배지 - 슬라이드에 따라 변경 */}
      <div className="absolute top-4 left-4 bg-[#B91C1C] text-white px-3 py-1 rounded-full text-sm">
        {slides[activeSlide].badge}
      </div>

      <div className="h-full flex flex-col justify-between pt-12">
        <div>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-500 absolute inset-x-6 top-16 ${activeSlide === index ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <h3 className="text-2xl font-bold mb-2 leading-tight">{slide.title}</h3>
              <p className="text-xl mb-4">{slide.description}</p>
              <p className="text-sm text-gray-400">{slide.tags}</p>
            </div>
          ))}
        </div>

        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-2 items-center">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <motion.button
              key={index}
              className={`rounded-full bg-red-400 bg-opacity-60`}
              animate={{
                width: activeSlide === index ? "24px" : "8px",
                height: "8px",
                opacity: activeSlide === index ? 1 : 0.6,
              }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setActiveSlide(index)
                clearInterval(intervalRef.current!)
                intervalRef.current = setInterval(() => {
                  setActiveSlide((prev) => (prev + 1) % totalSlides)
                }, 3500)
              }}
              aria-label={`슬라이드 ${index + 1}로 이동`}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}