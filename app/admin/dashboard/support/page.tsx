"use client"

import {useState} from "react"
import {CheckCircle2, Clock, MessageSquare, MoreHorizontal, Send, User} from "lucide-react"
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/user/ui/card"
import {Button} from "@/components/user/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/user/ui/avatar"
import {Badge} from "@/components/user/ui/badge"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/user/ui/tabs"
import {Input} from "@/components/user/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/user/ui/dropdown-menu"
import {ScrollArea} from "@/components/user/ui/scroll-area"
import {Separator} from "@/components/user/ui/separator"

type ChatMessage = {
  id: string
  sender: "user" | "admin"
  content: string
  timestamp: string
}

type ChatSession = {
  id: string
  user: {
    id: string
    name: string
    email: string
    avatar: string
  }
  status: "active" | "closed" | "pending"
  lastMessage: string
  lastMessageTime: string
  unread: number
  messages: ChatMessage[]
}

const chatSessions: ChatSession[] = [
  {
    id: "chat-1",
    user: {
      id: "user-1",
      name: "김민수",
      email: "kim@example.com",
      avatar: "/vibrant-city-market.png",
    },
    status: "active",
    lastMessage: "환불 정책에 대해 더 자세히 알고 싶습니다.",
    lastMessageTime: "2023-06-30T14:30:00",
    unread: 2,
    messages: [
      {
        id: "msg-1-1",
        sender: "user",
        content: "안녕하세요, 환불 정책에 대해 문의드립니다.",
        timestamp: "2023-06-30T14:25:00",
      },
      {
        id: "msg-1-2",
        sender: "admin",
        content: "안녕하세요, 김민수님. 무엇을 도와드릴까요?",
        timestamp: "2023-06-30T14:27:00",
      },
      {
        id: "msg-1-3",
        sender: "user",
        content: "강의를 구매한 후 일주일이 지났는데 환불이 가능한가요?",
        timestamp: "2023-06-30T14:28:00",
      },
      {
        id: "msg-1-4",
        sender: "user",
        content: "환불 정책에 대해 더 자세히 알고 싶습니다.",
        timestamp: "2023-06-30T14:30:00",
      },
    ],
  },
  {
    id: "chat-2",
    user: {
      id: "user-2",
      name: "이지은",
      email: "lee@example.com",
      avatar: "/diverse-group-brainstorming.png",
    },
    status: "active",
    lastMessage: "강의 업로드 과정에서 오류가 발생했습니다.",
    lastMessageTime: "2023-06-30T13:45:00",
    unread: 1,
    messages: [
      {
        id: "msg-2-1",
        sender: "user",
        content: "안녕하세요, 강의 업로드 중 문제가 있습니다.",
        timestamp: "2023-06-30T13:40:00",
      },
      {
        id: "msg-2-2",
        sender: "admin",
        content: "안녕하세요, 이지은님. 어떤 문제가 발생했나요?",
        timestamp: "2023-06-30T13:42:00",
      },
      {
        id: "msg-2-3",
        sender: "user",
        content: "강의 업로드 과정에서 오류가 발생했습니다.",
        timestamp: "2023-06-30T13:45:00",
      },
    ],
  },
  {
    id: "chat-3",
    user: {
      id: "user-3",
      name: "박준호",
      email: "park@example.com",
      avatar: "/diverse-group-brainstorming.png",
    },
    status: "pending",
    lastMessage: "결제가 완료되었는데 강의에 접근할 수 없습니다.",
    lastMessageTime: "2023-06-30T12:15:00",
    unread: 1,
    messages: [
      {
        id: "msg-3-1",
        sender: "user",
        content: "안녕하세요, 결제 후 강의 접근에 문제가 있습니다.",
        timestamp: "2023-06-30T12:15:00",
      },
    ],
  },
  {
    id: "chat-4",
    user: {
      id: "user-4",
      name: "최유진",
      email: "choi@example.com",
      avatar: "/diverse-group-celebrating.png",
    },
    status: "closed",
    lastMessage: "감사합니다. 문제가 해결되었습니다.",
    lastMessageTime: "2023-06-29T16:50:00",
    unread: 0,
    messages: [
      {
        id: "msg-4-1",
        sender: "user",
        content: "안녕하세요, 인증 코드가 작동하지 않습니다.",
        timestamp: "2023-06-29T16:30:00",
      },
      {
        id: "msg-4-2",
        sender: "admin",
        content: "안녕하세요, 최유진님. 새 인증 코드를 발송해드렸습니다. 확인해보세요.",
        timestamp: "2023-06-29T16:35:00",
      },
      {
        id: "msg-4-3",
        sender: "user",
        content: "감사합니다. 문제가 해결되었습니다.",
        timestamp: "2023-06-29T16:50:00",
      },
      {
        id: "msg-4-4",
        sender: "admin",
        content: "다른 문의사항이 있으시면 언제든지 문의해주세요.",
        timestamp: "2023-06-29T16:55:00",
      },
    ],
  },
  {
    id: "chat-5",
    user: {
      id: "user-5",
      name: "정승호",
      email: "jung@example.com",
      avatar: "/placeholder.svg?height=40&width=40&query=user5",
    },
    status: "closed",
    lastMessage: "네, 이해했습니다. 감사합니다.",
    lastMessageTime: "2023-06-28T11:20:00",
    unread: 0,
    messages: [
      {
        id: "msg-5-1",
        sender: "user",
        content: "안녕하세요, 수료증 발급 방법을 알고 싶습니다.",
        timestamp: "2023-06-28T11:00:00",
      },
      {
        id: "msg-5-2",
        sender: "admin",
        content: "안녕하세요, 정승호님. 강의 완료 후 '수료증 발급' 버튼을 클릭하시면 됩니다.",
        timestamp: "2023-06-28T11:05:00",
      },
      {
        id: "msg-5-3",
        sender: "user",
        content: "강의를 100% 완료해야 하나요?",
        timestamp: "2023-06-28T11:10:00",
      },
      {
        id: "msg-5-4",
        sender: "admin",
        content: "네, 모든 강의를 시청하셔야 수료증이 발급됩니다.",
        timestamp: "2023-06-28T11:15:00",
      },
      {
        id: "msg-5-5",
        sender: "user",
        content: "네, 이해했습니다. 감사합니다.",
        timestamp: "2023-06-28T11:20:00",
      },
    ],
  },
]

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredChats = chatSessions.filter((chat) => {
    // 상태 필터링
    if (activeTab !== "all" && chat.status !== activeTab) return false

    // 검색어 필터링
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        chat.user.name.toLowerCase().includes(query) ||
        chat.user.email.toLowerCase().includes(query) ||
        chat.lastMessage.toLowerCase().includes(query)
      )
    }

    return true
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return

    // 실제 구현에서는 API 호출을 통해 메시지 전송
    console.log(`Sending message to ${selectedChat.user.name}: ${newMessage}`)

    // 메시지 전송 후 입력창 초기화
    setNewMessage("")
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString("ko-KR", {hour: "2-digit", minute: "2-digit"})
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("ko-KR")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">고객 지원</h2>
        <p className="text-muted-foreground">사용자 문의를 관리하고 실시간 채팅으로 지원하세요.</p>
      </div>

      <div className="grid h-[calc(100vh-220px)] grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="px-4 py-3">
            <div className="flex items-center justify-between">
              <CardTitle>채팅 목록</CardTitle>
              <Badge variant="outline" className="ml-2">
                {filteredChats.filter((chat) => chat.status === "active" || chat.status === "pending").length} 활성
              </Badge>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Input
                placeholder="이름 또는 내용 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9"
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-4">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">
                    전체
                  </TabsTrigger>
                  <TabsTrigger value="active" className="flex-1">
                    진행중
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="flex-1">
                    대기중
                  </TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1">
                    종료
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="m-0">
                <ScrollArea className="h-[calc(100vh-350px)]">
                  {filteredChats.length > 0 ? (
                    <div>
                      {filteredChats.map((chat) => (
                        <div
                          key={chat.id}
                          className={`flex cursor-pointer items-start gap-3 border-b p-4 transition-colors hover:bg-muted/50 ${
                            selectedChat?.id === chat.id ? "bg-muted" : ""
                          }`}
                          onClick={() => setSelectedChat(chat)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={chat.user.avatar || "/placeholder.svg"} alt={chat.user.name}/>
                            <AvatarFallback>{chat.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{chat.user.name}</div>
                              <div className="text-xs text-muted-foreground">{formatTime(chat.lastMessageTime)}</div>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{chat.lastMessage}</div>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant={
                                  chat.status === "active"
                                    ? "default"
                                    : chat.status === "pending"
                                      ? "secondary"
                                      : "outline"
                                }
                                className="text-[10px] px-1 py-0"
                              >
                                {chat.status === "active" ? "진행중" : chat.status === "pending" ? "대기중" : "종료"}
                              </Badge>
                              {chat.unread > 0 && (
                                <Badge className="h-5 w-5 rounded-full p-0 text-[10px]">{chat.unread}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center">
                      <p className="text-center text-sm text-muted-foreground">검색 결과가 없습니다.</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          {selectedChat ? (
            <>
              <CardHeader className="flex flex-row items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedChat.user.avatar || "/placeholder.svg"} alt={selectedChat.user.name}/>
                    <AvatarFallback>{selectedChat.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{selectedChat.user.name}</CardTitle>
                    <CardDescription className="text-xs">{selectedChat.user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      selectedChat.status === "active"
                        ? "default"
                        : selectedChat.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedChat.status === "active"
                      ? "진행중"
                      : selectedChat.status === "pending"
                        ? "대기중"
                        : "종료"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4"/>
                        <span className="sr-only">더 보기</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>작업</DropdownMenuLabel>
                      <DropdownMenuItem>사용자 정보 보기</DropdownMenuItem>
                      <DropdownMenuItem>이전 문의 내역</DropdownMenuItem>
                      <DropdownMenuSeparator/>
                      <DropdownMenuItem>채팅 종료</DropdownMenuItem>
                      <DropdownMenuItem>다른 관리자에게 이관</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <Separator/>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-430px)] p-4">
                  <div className="space-y-4">
                    {selectedChat.messages.map((message, index) => {
                      const showDate =
                        index === 0 ||
                        new Date(message.timestamp).toDateString() !==
                        new Date(selectedChat.messages[index - 1].timestamp).toDateString()

                      return (
                        <div key={message.id} className="space-y-4">
                          {showDate && (
                            <div className="flex justify-center">
                              <Badge variant="outline" className="bg-background">
                                {formatDate(message.timestamp)}
                              </Badge>
                            </div>
                          )}
                          <div className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`flex max-w-[80%] flex-col ${
                                message.sender === "admin" ? "items-end" : "items-start"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {message.sender === "user" && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage
                                      src={selectedChat.user.avatar || "/placeholder.svg"}
                                      alt={selectedChat.user.name}
                                    />
                                    <AvatarFallback>{selectedChat.user.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                )}
                                <span className="text-xs text-muted-foreground">
                                  {message.sender === "user" ? selectedChat.user.name : "관리자"}
                                </span>
                                {message.sender === "admin" && (
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src="/abstract-admin-interface.png" alt="관리자"/>
                                    <AvatarFallback>관</AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                              <div
                                className={`mt-1 rounded-lg px-4 py-2 ${
                                  message.sender === "admin" ? "bg-primary text-primary-foreground" : "bg-muted"
                                }`}
                              >
                                <p className="text-sm">{message.content}</p>
                              </div>
                              <span className="mt-1 text-xs text-muted-foreground">
                                {formatTime(message.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="p-4">
                <div className="flex w-full items-center gap-2">
                  <Input
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={selectedChat.status === "closed"}
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={selectedChat.status === "closed"}>
                    <Send className="h-4 w-4"/>
                    <span className="sr-only">보내기</span>
                  </Button>
                </div>
              </CardFooter>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground"/>
              <h3 className="mt-4 text-lg font-medium">채팅을 선택하세요</h3>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                왼쪽 목록에서 채팅을 선택하여 대화를 시작하세요.
              </p>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>고객 지원 통계</CardTitle>
          <CardDescription>고객 지원 현황과 통계를 확인하세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <MessageSquare className="h-5 w-5 text-primary"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 문의</p>
                <p className="text-2xl font-bold">152</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Clock className="h-5 w-5 text-primary"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">평균 응답 시간</p>
                <p className="text-2xl font-bold">15분</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-primary"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">해결된 문의</p>
                <p className="text-2xl font-bold">142</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <User className="h-5 w-5 text-primary"/>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">만족도</p>
                <p className="text-2xl font-bold">4.8/5</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
