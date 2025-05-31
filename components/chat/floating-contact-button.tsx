// "use client"

// import React, { useState, useRef, useEffect } from "react"
// import { MessageCircle, Smile, Paperclip, X } from 'lucide-react'
// import { motion, AnimatePresence } from "framer-motion"
// import axios from "axios"
// import { connectSocket, disconnectSocket, sendChatMessage } from "@/lib/socket"
// import useUserStore from "@/app/auth/userStore"

// // 채팅 메시지 타입 정의
// export type Message = {
//   id: string
//   text: string
//   sender: "user" | "agent"
//   timestamp?: string
//   action?: string
// }

// // 초기 안내 메시지
// const initialMessages: Message[] = [
//   { id: 'init-1', text: '안녕하세요 CODEFLIX입니다 😊', sender: 'agent', timestamp: '' },
//   { id: 'init-2', text: '오늘도 CODEFLIX를 이용해주셔서 감사해요.', sender: 'agent', timestamp: '' },
//   { id: 'init-3', text: '문의사항을 메시지로 보내주시면 상담사가 연결됩니다. 조금만 기다려주세요.', sender: 'agent', timestamp: '' },
// ]

// export function FloatingContactButton() {
//   const API_URL = process.env.NEXT_PUBLIC_API_URL!
//   const inquiryRoomId = 1   // TODO: getOrCreateRoom 로 받아온 실제 방 ID 로 교체
//   const { user } = useUserStore()

//   const [isOpen, setIsOpen] = useState(false)
//   const [messages, setMessages] = useState<Message[]>([...initialMessages])
//   const [inputValue, setInputValue] = useState("")
//   const messagesEndRef = useRef<HTMLDivElement>(null)
//   const inputRef = useRef<HTMLInputElement>(null)

//   // 1) 채팅창 열림 시: 과거 메시지 로딩 + 읽음 처리
//   useEffect(() => {
//     if (!isOpen || !user) return

//     axios
//       // GET /api/chat/inquiry/rooms/{roomId}
//       .get<{ messages: { messageId: number; content: string; sender: "USER"|"ADMIN"; sendAt: string; isRead: boolean }[] }>(
//         `${API_URL}/api/chat/inquiry/rooms/${inquiryRoomId}`
//       )
//       .then(res => {
//         const fetched = res.data.messages.map(m => ({
//           id: m.messageId.toString(),
//           text: m.content,
//           sender: m.sender === 'ADMIN' ? 'agent' : 'user',
//           timestamp: new Date(m.sendAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//         }))
//         setMessages([...initialMessages, ...fetched])

//         // 읽음 처리
//         const unreadIds = res.data.messages
//           .filter(m => m.sender === 'USER' && !m.isRead)
//           .map(m => m.messageId)
//         if (unreadIds.length) {
//           sendChatMessage("/app/inquiry/read", {
//             roomId: inquiryRoomId,
//             adminId: user.id,
//             messageIds: unreadIds,
//           })
//         }
//       })
//       .catch(console.error)
//   }, [isOpen, API_URL, inquiryRoomId, user])

//   // 2) WebSocket 연결 / 구독
//   useEffect(() => {
//     if (isOpen && user) {
//       connectSocket(
//         inquiryRoomId,
//         (body: any) => {
//           if (body.message) {
//             const incoming: Message = {
//               id: body.messageId.toString(),
//               text: body.content,
//               sender: body.sender === 'ADMIN' ? 'agent' : 'user',
//               timestamp: new Date(body.sendAt)
//                 .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//             }
//             setMessages(prev => [...prev, incoming])
//           }
//         },
//         undefined
//       )
//     } else {
//       disconnectSocket()
//     }
//     return () => { disconnectSocket() }
//   }, [isOpen, inquiryRoomId, user])

//   // 3) 스크롤 & 입력 포커스
//   useEffect(() => {
//     if (isOpen) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//       setTimeout(() => inputRef.current?.focus(), 100)
//     }
//   }, [isOpen, messages])

//   // 4) 입력값 & 전송
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!inputValue.trim() || !user) return

//     const now = new Date()
//     const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     const text = inputValue.trim()

//     // 화면 즉시 반영
//     const tempId = Date.now().toString()
//     setMessages(prev => [...prev, { id: tempId, text, sender: 'user', timestamp: time }])
//     setInputValue("")

//     try {
//       // POST /api/chat/inquiry/rooms/{roomId}/user/message
//       await axios.post(
//         `${API_URL}/api/chat/inquiry/rooms/${inquiryRoomId}/user/message`,
//         { adminId: user.id, message: text }
//       )
//     } catch (err) {
//       console.error("메시지 저장 실패:", err)
//     }
//   }

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) =>
//     setInputValue(e.target.value)

//   const handleActionClick = (action: string) => {
//     console.log("Action clicked:", action)
//   }

//   return (
//     <>
//       {/* 문의하기 버튼 */}
//       {!isOpen && (
//         <motion.button
//           whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
//           onClick={() => setIsOpen(true)}
//           className="fixed bottom-6 right-6 z-50 flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-5 text-white shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 border border-red-500/20"
//         >
//           <span className="font-medium tracking-wide">문의하기</span>
//           <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
//             <MessageCircle className="h-5 w-5 text-white" />
//           </div>
//         </motion.button>
//       )}

//       {/* 채팅 인터페이스 */}
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }}
//             className="fixed bottom-6 right-6 z-50 h-[600px] w-[380px] overflow-hidden rounded-lg bg-black border border-zinc-800 shadow-xl flex flex-col"
//             style={{ boxShadow: "0 0 20px rgba(220,38,38,0.2)" }}
//           >
//             {/* 헤더 */}
//             <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-4 py-3">
//               <div className="flex items-center gap-2">
//                 <img
//                   src="https://my-home-shoppingmall-bucket.s3.ap-northeast-2.amazonaws.com/profile/1744964448772_KakaoTalk_20250418_093314632.jpg"
//                   alt="Agent"
//                   className="h-11 w-11 rounded-full object-cover"
//                 />
//                 <div>
//                   <span className="font-medium text-white">CODEFLIX</span>
//                   <p className="text-xs text-zinc-400">관리자가 바로 답변해 드려요</p>
//                 </div>
//               </div>
//               <button
//                 onClick={() => setIsOpen(false)}
//                 className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>

//             {/* 메시지 영역 */}
//             <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-zinc-900">
//               <div className="space-y-4">
//                 {messages.map(msg => (
//                   <div
//                     key={msg.id}
//                     className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//                   >
//                     {msg.sender === "agent" && (
//                       <img
//                         src="https://avatars.githubusercontent.com/u/105035782?v=4"
//                         alt="Agent"
//                         className="mr-2 mt-1 h-9 w-9 rounded-full object-cover"
//                       />
//                     )}
//                     <div className="flex flex-col">
//                       {msg.sender === "agent" && (
//                         <span className="mb-1 ml-1 text-xs text-zinc-500">CODEFLIX</span>
//                       )}
//                       <div
//                         className={`max-w-[240px] rounded-2xl px-4 py-2.5 ${
//                           msg.sender === "user"
//                             ? "bg-red-600 text-white self-end"
//                             : "bg-zinc-800 text-zinc-100 self-start"
//                         }`}
//                       >
//                         <p className="text-sm">{msg.text}</p>
//                       </div>
//                       {msg.timestamp && (
//                         <span
//                           className={`mt-1 text-[10px] ${
//                             msg.sender === "user" ? "self-end mr-1" : "self-start ml-1"
//                           } text-zinc-500`}
//                         >
//                           {msg.timestamp}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//               </div>
//             </div>

//             {/* 입력 폼 */}
//             <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-zinc-800 bg-zinc-900 p-3">
//               <div className="relative flex-1">
//                 <input
//                   ref={inputRef}
//                   type="text"
//                   value={inputValue}
//                   onChange={handleInputChange}
//                   placeholder="관리자에게 질문해 주세요."
//                   className="w-full rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
//                 />
//                 <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
//                   <Smile className="h-5 w-5 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
//                   <Paperclip className="h-5 w-5 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
//                 </div>
//               </div>
//               <motion.button
//                 type="submit"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 className="rounded-full bg-red-600 p-2"
//               >
//                 <MessageCircle className="h-5 w-5 text-white" />
//               </motion.button>
//             </form>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </>
//   )
// }


"use client"

import React, { useState, useRef, useEffect } from "react"
import { MessageCircle, Smile, Paperclip, X } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"

// 채팅 메시지 타입 정의
export type Message = {
  id: string
  text: string
  sender: "user" | "agent"
  timestamp?: string
}

// 초기 안내 메시지
const initialMessages: Message[] = [
  { id: 'init-1', text: '안녕하세요 CODEFLIX입니다 😊', sender: 'agent', timestamp: '' },
  { id: 'init-2', text: '오늘도 CODEFLIX를 이용해주셔서 감사해요.', sender: 'agent', timestamp: '' },
  { id: 'init-3', text: '문의사항을 메시지로 보내주시면 상담사가 연결됩니다. 조금만 기다려주세요.', sender: 'agent', timestamp: '' },
]

export function FloatingContactButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([...initialMessages])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // 채팅창 열릴 때 스크롤 & 포커스
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, messages])

  // 입력값 & 전송
  const [isFirstMessageSent, setIsFirstMessageSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const text = inputValue.trim()

    const tempId = Date.now().toString()
    const newUserMessage: Message = { id: tempId, text, sender: 'user', timestamp: time }

    setMessages(prev => [...prev, newUserMessage])  // 🔥 유저 메시지 한 번만 추가
    setInputValue("")

    if (!isFirstMessageSent) {
      setIsFirstMessageSent(true)

      // (1) 0.3초 뒤 "상담사 연결 중입니다" 추가
      setTimeout(() => {
        const connectingMessage: Message = {
          id: `connect-${Date.now()}`,
          text: "상담사 연결 중입니다...",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => [...prev, connectingMessage])
      }, 300)

      // (2) 5초 뒤 "상담사가 연결되었습니다" 추가
      setTimeout(() => {
        const connectedMessage: Message = {
          id: `connected-${Date.now()}`,
          text: "상담사가 연결되었습니다. 무엇을 도와드릴까요?",
          sender: 'agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages(prev => [...prev, connectedMessage])
      }, 5000)
    }
  }



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  return (
    <>
      {/* 문의하기 버튼 */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-5 text-white shadow-lg hover:from-red-700 hover:to-red-800 transition-all duration-300 border border-red-500/20"
        >
          <span className="font-medium tracking-wide">문의하기</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <MessageCircle className="h-5 w-5 text-white" />
          </div>
        </motion.button>
      )}

      {/* 채팅 인터페이스 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 h-[600px] w-[380px] overflow-hidden rounded-lg bg-black border border-zinc-800 shadow-xl flex flex-col"
            style={{ boxShadow: "0 0 20px rgba(220,38,38,0.2)" }}
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between bg-zinc-900 border-b border-zinc-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <img
                  src="https://my-home-shoppingmall-bucket.s3.ap-northeast-2.amazonaws.com/profile/1744964448772_KakaoTalk_20250418_093314632.jpg"
                  alt="Agent"
                  className="h-11 w-11 rounded-full object-cover"
                />
                <div>
                  <span className="font-medium text-white">CODEFLIX</span>
                  <p className="text-xs text-zinc-400">실제 상담사가 바로 답변해 드려요</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 메시지 영역 */}
            <div className="flex-1 overflow-y-auto bg-zinc-950 p-4 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-zinc-900">
              <div className="space-y-4">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.sender === "agent" && (
                      <img
                        src="https://avatars.githubusercontent.com/u/105035782?v=4"
                        alt="Agent"
                        className="mr-2 mt-1 h-9 w-9 rounded-full object-cover"
                      />
                    )}
                    <div className="flex flex-col">
                      {msg.sender === "agent" && (
                        <span className="mb-1 ml-1 text-xs text-zinc-500">CODEFLIX</span>
                      )}
                      <div
                        className={`max-w-[240px] rounded-2xl px-4 py-2.5 ${
                          msg.sender === "user"
                            ? "bg-red-600 text-white self-end"
                            : "bg-zinc-800 text-zinc-100 self-start"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      {msg.timestamp && (
                        <span
                          className={`mt-1 text-[10px] ${
                            msg.sender === "user" ? "self-end mr-1" : "self-start ml-1"
                          } text-zinc-500`}
                        >
                          {msg.timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* 입력 폼 */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-zinc-800 bg-zinc-900 p-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="관리자에게 질문해 주세요."
                  className="w-full rounded-full border border-zinc-700 bg-zinc-800 px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  <Smile className="h-5 w-5 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
                  <Paperclip className="h-5 w-5 text-zinc-500 hover:text-zinc-300 cursor-pointer" />
                </div>
              </div>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-full bg-red-600 p-2"
              >
                <MessageCircle className="h-5 w-5 text-white" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
