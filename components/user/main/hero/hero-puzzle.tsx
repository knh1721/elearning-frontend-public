"use client";

import { motion } from "framer-motion";
import "./hero-puzzle.css"; // CSS 파일 임포트

export default function HeroPuzzle() {
  return (
    <div className="relative">
      {/* 메인 컨테이너 */}
      <div
        className="hero-container relative w-[1200px] h-[738px] bg-black rounded-[30px] overflow-hidden"
        aria-label="히어로 섹션"
      >
        {/* 배경 이미지 */}
        <img
          src="https://images.squarespace-cdn.com/content/v1/59afca87c027d8e9bfaa762c/1526327198093-H0KCEJOIQ16H4T9U8CW6/Coding+Gif"
          // src="https://www.icegif.com/wp-content/uploads/2023/06/icegif-906.gif"
          // src="/codeflixDemo.gif"
          alt="코드 배경"
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />

        {/* 텍스트와 버튼 */}
        <div className="relative z-10 h-full flex flex-col justify-between p-12">
          {/* <h2 className="text-[54px] leading-[1.2] font-normal text-white mt-16">
            여기서
            <br />
            내일이 시작됩니다
          </h2> */}

          {/* <div className="button-container">
            <motion.button
              className="flex items-center gap-3 mb-12"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-white text-lg">자세히 알아보기</span>
              <motion.span
                className="w-[42px] h-[42px] rounded-full bg-white flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M13 17l5-5-5-5M6 12h12"
                    stroke="black"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.span>
            </motion.button>
          </div> */}
        </div>
      </div>

      {/* 전구 요소 - 메인 컨테이너 위에 겹치게 */}
      <div className="absolute top-0 right-0 transform translate-x-[40px] -translate-y-[10px]">
        <div className="bulb-container">
          {/* 전구 아이콘만 넣으면 배경은 ::before/::after 가 처리 */}
          <img
            src="https://t1.kakaocdn.net/kakaocorp/kakaocorp/admin/report/c925fb39018c00001.gif"
            alt="전구 아이콘"
            className="bulb-icon"
            draggable={false}
          />
        </div>
      </div>
      {/* 자세히 알아보기 버튼 (왼쪽 아래) */}
      <div className="detail-btn-container">
        <motion.button
          className="detail-btn flex items-center gap-3"
          transition={{duration: 0.2}}
        >
          <span className="text-white text-[16px] pt-4">자세히 알아보기</span>
          <motion.span
            className="w-[42px] h-[42px] rounded-full bg-black flex items-center justify-center pt-4"
            whileHover={{scale: 1.1}}
            transition={{duration: 0.2}}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M13 17l5-5-5-5M6 12h12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
}