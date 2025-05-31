"use client"

import React, { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Send,
  Home,
  Edit,
  Settings,
  Smile,
  Paperclip,
  ChevronDown,
  Phone,
  Video,
  Info,
} from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Input } from "@/components/user/ui/input"
import { useChatSettings } from "@/hooks/use-chat-settings"
import ChatSettings from "@/components/chat/chat-setting"
import NewMessageModal from "@/components/chat/new-massage-modal"
import useUserStore from "@/app/auth/userStore"
import useHeaderStore from "@/app/auth/useHeaderStore"
import { connectSocket, disconnectSocket, sendChatMessage } from "@/lib/socket"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import "dayjs/locale/ko"

dayjs.extend(relativeTime)
dayjs.locale("ko")

interface Chat {
  roomId: number
  name: string
  lastMessage: string
  time: string
  online: boolean
  participantCount: number
  unreadCount: number
  lastMessageAt: string
  profileUrl?: string
}

interface Message {
  id: number
  roomId: number
  userId: number
  nickname: string
  profileUrl?: string
  isInstructor?: boolean
  content: string
  time: string
  isImage: boolean
  imageUrl?: string
  isRead: boolean
  readCount: number
  participantCount?: number
}

interface ReadEventPayload {
  type: "READ"
  roomId: number
  userId: number
  messageIds: number[]
}

interface SendMessagePayload {
  roomId: number
  userId: number
  nickname: string
  profileUrl?: string
  isInstructor?: boolean
  content: string
  time: string
  isImage: boolean
  imageUrl?: string
}

export default function ChatPage() {
  const { user } = useUserStore()
  const { fontSize, fontFamily } = useChatSettings()
  const API_URL = process.env.NEXT_PUBLIC_API_URL!

  const [chats, setChats] = useState<Chat[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [message, setMessage] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const getRelativeTime = (dateStr: string | Date | null | undefined) => {
    if (!dateStr || dayjs(dateStr).toString() === "Invalid Date") return ""
    const date = dayjs(dateStr)
    const now = dayjs()
    return now.diff(date, "day") >= 1 ? date.format("MM/DD") : date.fromNow()
  }


  const truncateName = (name: string, maxLength = 25) => {
    return name.length > maxLength ? name.slice(0, maxLength) + "..." : name
  }

  const chat = selectedRoomId != null ? chats.find((c) => c.roomId === selectedRoomId) : undefined
  const otherNames = chat ? chat.name.split(", ").filter((n) => n !== user?.nickname).join(", ") : ""
  const isGroup = chat ? chat.participantCount > 2 : false

  useEffect(() => {
    if (!user) return
    fetch(`${API_URL}/api/chat/rooms?userId=${user.id}`)
      .then((r) => r.json())
      .then((rooms: Chat[]) => setChats(rooms))
      .catch(console.error)
  }, [user, API_URL])

  useEffect(() => {
    if (!selectedRoomId || !user) return;

    const pendingMessageIds = new Set(); // 전송 중인 메시지 ID 추적

    connectSocket(selectedRoomId, (body) => {
      if (body.type === "READ") return;
    
      // ✨ "content"가 없는 경우 무시
      if (!body.content) {
        console.warn("content 없는 메시지 수신:", body);
        return;
      }
    
      const msg = body as Message;
    
      if (msg.userId === user.id) {
        setMessages((prev) =>
          prev.map((m) => {
            if (m.content === msg.content && m.time === msg.time && m.userId === msg.userId) {
              pendingMessageIds.delete(m.id);
              return { ...msg };
            }
            return m;
          })
        );
      } else {
        setMessages((prev) =>
          prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
        );
      }
    });
    

    return () => disconnectSocket();
  }, [selectedRoomId, user]);

  // useEffect(() => {
  //   if (!selectedRoomId || !user) return;

  //   const pendingMessageIds = new Set(); // 전송 중인 메시지 ID 추적

  //   connectSocket(selectedRoomId, (body) => {
  //     if (body.type === "READ") return;

  //     const msg = body as Message;

  //     // 내가 보낸 메시지인 경우, 서버에서 받은 정보로 기존 메시지 업데이트
  //     if (msg.userId === user.id) {
  //       setMessages((prev) =>
  //         prev.map((m) => {
  //           // 내용과 시간이 동일한 메시지 찾기 (임시 ID 대신)
  //           if (m.content === msg.content &&
  //             m.time === msg.time &&
  //             m.userId === msg.userId) {
  //             pendingMessageIds.delete(m.id); // 추적 목록에서 제거
  //             return { ...msg }; // 서버 ID로 업데이트
  //           }
  //           return m;
  //         })
  //       );
  //     } else {
  //       // 다른 사람이 보낸 메시지는 중복 체크 후 추가
  //       setMessages((prev) =>
  //         prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]
  //       );
  //     }
  //   });

  //   return () => disconnectSocket();
  // }, [selectedRoomId, user]);

  useEffect(() => {
    if (!selectedRoomId || !user) return
    fetch(`${API_URL}/api/chat/rooms/${selectedRoomId}/messages`)
      .then((r) => r.json())
      .then(async (data: Message[]) => {
        setMessages((prev) => [
          ...prev.filter((m) => m.roomId !== selectedRoomId),
          ...data.map((d) => ({ ...d, isRead: true })),
        ])
        await fetch(`${API_URL}/api/chat/rooms/${selectedRoomId}/read?userId=${user.id}`, { method: "PUT" })
        setChats((prev) => prev.map((c) => (c.roomId === selectedRoomId ? { ...c, unreadCount: 0 } : c)))
        sendChatMessage("/app/chat/read", {
          type: "READ",
          roomId: selectedRoomId,
          userId: user.id,
          messageIds: data.map((m) => m.id),
        } as ReadEventPayload)
      })
      .catch(console.error)
  }, [selectedRoomId, user, API_URL])

  // 메시지 전송 함수 수정
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedRoomId || !user) return;

    const payload: SendMessagePayload = {
      roomId: selectedRoomId,
      userId: user.id,
      nickname: user.nickname,
      profileUrl: user.profileUrl,
      isInstructor: user.isInstructor === 1,
      content: message,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isImage: false,
    };

    // 임시 ID 생성
    const fallbackId = Date.now() * 1000 + Math.floor(Math.random() * 1000);

    // 메시지 전송 전 UI 업데이트
    setMessages((prev) => [
      ...prev,
      {
        ...payload,
        id: fallbackId,
        isRead: true,
        readCount: 0,
        participantCount: chat?.participantCount ?? 1
      },
    ]);

    // 메시지 입력창 초기화
    setMessage("");

    // 채팅방 목록 업데이트
    setChats((prev) =>
      prev
        .map((c) =>
          c.roomId === selectedRoomId
            ? {
              ...c,
              lastMessage: payload.content,
              time: payload.time,
              unreadCount: 0, // 내가 보낸 메시지는 읽음 처리
              lastMessageAt: new Date().toISOString()
            }
            : c
        )
        .sort((a, b) => (a.roomId === selectedRoomId ? -1 : b.roomId === selectedRoomId ? 1 : 0))
    );

    // 메시지 전송 - 에러 처리 추가
    try {
      sendChatMessage("/app/chat/message", payload);
    } catch (error) {
      console.error("메시지 전송 실패:", error);

      // 실패 시 사용자에게 알림
      alert("메시지 전송에 실패했습니다. 다시 시도해주세요.");

      // 실패한 메시지 표시 (빨간색 배경 깜빡임 대신)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === fallbackId
            ? { ...m, error: true } // 에러 상태 추가
            : m
        )
      );
    }
  };

  useEffect(() => {
    const total = chats.reduce((sum, c) => {
      const cnt = messages.filter((m) => m.roomId === c.roomId && !m.isRead && m.userId !== user?.id).length
      return sum + cnt
    }, 0)
    useHeaderStore.getState().setUnreadCount(total)
  }, [chats, messages, user])

  const prevLen = useRef(0)
  useEffect(() => {
    if (messages.length > prevLen.current) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    prevLen.current = messages.length
  }, [messages.length])

  const handleCreateRoom = async (selected: { id: number }[]) => {
    if (!user) return
    const participantIds = [...selected.map((u) => u.id), user.id]
    const res = await fetch(`${API_URL}/api/chat/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participantIds }),
    })
    const newRoom = (await res.json()) as Chat
    setChats((prev) => [...prev, newRoom])
    setSelectedRoomId(newRoom.roomId)
  }

  const getFontFamilyStyle = () => {
    switch (fontFamily) {
      case "noto-sans-kr": return '"Noto Sans KR", sans-serif'
      case "nanum-gothic": return '"Nanum Gothic", sans-serif'
      case "serif": return "ui-serif, Georgia, serif"
      case "mono": return "ui-monospace, SFMono-Regular, monospace"
      default: return "ui-sans-serif, system-ui, sans-serif"
    }
  }

  function getRandomColor(seed: string) {
    const colors = ["#EF4444", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B"];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  }

  return (
    <div className="flex h-full bg-black text-white overflow-x-auto">
      {/* ─── 좌측 채팅방 리스트 ─── */}
      <div className="w-[320px] min-w-[320px] border-r border-gray-800 flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-gray-800">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <Home className="h-5 w-5 text-white" />
              </Button>
            </Link>
            <h2 className="font-bold">{user?.nickname}</h2>
            <ChevronDown className="h-4 w-4 text-white" />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-5 w-5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewMessageModal(true)}
            >
              <Edit className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((c) => {
            const names = c.name
              .split(", ")
              .filter((n) => n !== user?.nickname)
              .join(", ")
            const initial = names.charAt(0) || ""
            const groupFlag = c.participantCount > 2
            const isPlaceholder = c.profileUrl?.includes("placeholder.svg");

            // 로컬 messages 상태 기준으로 실제 언리드 개수 계산
            const unread = c.unreadCount

            return (
              <div
                key={c.roomId}
                className={`p-3 flex items-start space-x-3 hover:bg-gray-900 cursor-pointer ${
                  selectedRoomId === c.roomId ? "bg-gray-900" : ""
                }`}
                onClick={() => setSelectedRoomId(c.roomId)}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden ${
                    groupFlag ? "bg-gray-700" : ""
                  }`}
                  style={{
                    backgroundColor: !groupFlag && c.profileUrl?.includes("placeholder.svg")
                      ? getRandomColor(names)
                      : undefined,
                  }}
                >
                  {groupFlag ? (
                    "그룹"
                  ) : c.profileUrl?.includes("placeholder.svg") ? (
                    names.charAt(0)
                  ) : (
                    <Image
                      src={c.profileUrl || "/placeholder.svg"}
                      alt="profile"
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-center">
                      <span
                        title={names} // 전체 이름 툴팁으로 보기
                        className={`font-medium truncate max-w-[160px] ${
                          unread ? "text-white" : "text-gray-400"
                        }`}
                      >
                        {truncateName(names)}
                        {groupFlag && (
                          <span className="ml-1 text-xs text-gray-400">
                            ({c.participantCount}명)
                          </span>
                        )}
                      </span>
                    <span className="text-xs text-gray-400">{getRelativeTime(c.lastMessageAt)}</span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      unread ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {c.lastMessage}
                  </p>
                </div>
                {unread > 0 && (
                  <div className="flex-shrink-0">
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unread}
                      </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>


      {/* ─── 우측 메시지 영역 ─── */}
      {selectedRoomId ? (
        <div className="flex-1 flex flex-col">
          {/* 헤더 */}
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              {isGroup ? (
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                  그룹
                </div>
              ) : chat?.profileUrl && !chat.profileUrl.includes("placeholder.svg") ? (
                <Image
                  src={chat.profileUrl}
                  alt="profile"
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: getRandomColor(otherNames) }}
                >
                  {otherNames.charAt(0)}
                </div>
              )}

              <div>
                <h3 className="font-medium text-white">
                  {otherNames}
                  {isGroup && (
                    <span className="ml-2 text-sm text-gray-400">({chat!.participantCount}명)</span>
                  )}
                </h3>
                <p className="text-xs text-gray-400">활동 {chat!.time}</p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button variant="ghost" size="icon"><Phone className="h-5 w-5 text-white" /></Button>
              <Button variant="ghost" size="icon"><Video className="h-5 w-5 text-white" /></Button>
              <Button variant="ghost" size="icon"><Info className="h-5 w-5 text-white" /></Button>
            </div>
          </div>


          {/* 메시지 리스트 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages
              .filter((m) => m.roomId === selectedRoomId)
              .map((msg, idx, arr) => {
                const isMe = msg.userId === user?.id
                const prev = arr[idx - 1]
                const next = arr[idx + 1]
                const isNewGroup = !prev || prev.userId !== msg.userId
                const indentClass = !isMe && !isNewGroup ? "ml-12" : ""
                const showTime = !next || next.time !== msg.time
                const unreadCnt =
                  msg.participantCount != null
                    ? msg.participantCount - msg.readCount - 1
                    : 0

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start mb-2 ${isMe ? "justify-end" : ""}`}
                  >
                    {/* 1) 프로필 아바타 */}
                    {!isMe && isNewGroup && (
                      msg.profileUrl?.includes("placeholder.svg") || !msg.profileUrl ? (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3"
                          style={{ backgroundColor: getRandomColor(msg.nickname) }}
                        >
                          {msg.nickname.charAt(0)}
                        </div>
                      ) : (
                        <div className="flex-shrink-0 mr-3">
                          <Image
                            src={msg.profileUrl}
                            alt={msg.nickname}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        </div>
                      )
                    )}
                    {/* 2) 닉네임 + 말풍선 + 메타 */}
                    <div className={`${indentClass} flex flex-col`}>
                      {/* 닉네임 (첫 메시지일 때만) */}
                      {!isMe && isNewGroup && (
                        <span className="text-xs text-gray-400 mb-1">
                        {msg.nickname}
                      </span>
                      )}

                      {/* 말풍선 + 메타를 한 줄에 */}
                      <div className="flex items-end">
                        {/* 남의 메시지: 메타는 오른쪽 */}
                        {!isMe && (
                          <>
                            {/* 말풍선 */}
                            <div className="px-4 py-2 rounded-3xl bg-gray-800 rounded-bl-sm">
                              <p
                                style={{
                                  fontSize: `${fontSize}px`,
                                  fontFamily: getFontFamilyStyle(),
                                }}
                              >
                                {msg.content}
                              </p>
                            </div>
                            {/* 메타 (언리드·시간) */}
                            <div className="flex flex-col-reverse items-start ml-1">
                              {showTime && <span className="text-xs text-gray-500">{msg.time}</span>}
                              {unreadCnt > 0 && <span className="text-xs text-gray-300">{unreadCnt}</span>}
                            </div>
                          </>
                        )}

                        {/* 내 메시지: 메타는 왼쪽 */}
                        {isMe && (
                          <>
                            <div className="flex flex-col-reverse items-end mr-1">
                              {showTime && <span className="text-xs text-gray-500">{msg.time}</span>}
                              {unreadCnt > 0 && <span className="text-xs text-gray-300">{unreadCnt}</span>}
                            </div>
                            <div className="px-4 py-2 rounded-3xl bg-red-600 rounded-br-sm">
                              <p
                                style={{
                                  fontSize: `${fontSize}px`,
                                  fontFamily: getFontFamilyStyle(),
                                }}
                              >
                                {msg.content}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}

            <div ref={messagesEndRef} />
          </div>

          {/* 입력창 */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex items-center space-x-2">
            <Button type="button" variant="ghost" size="icon"><Smile className="h-5 w-5 text-white" /></Button>
            <Input
              placeholder="메시지 입력..."
              className="bg-gray-800 border-gray-700 text-white flex-1"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ fontSize: `${fontSize}px`, fontFamily: getFontFamilyStyle() }}
            />
            <Button type="button" variant="ghost" size="icon"><Paperclip className="h-5 w-5 text-white" /></Button>
            <Button type="submit" size="icon" className="bg-red-600"><Send className="h-5 w-5 text-white" /></Button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">채팅을 선택하세요</div>
      )}

      <ChatSettings isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <NewMessageModal isOpen={showNewMessageModal} onClose={() => setShowNewMessageModal(false)} onSelectUsers={handleCreateRoom} />
    </div>
  )
}