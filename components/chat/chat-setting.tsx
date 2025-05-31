"use client"
import { X } from "lucide-react"
import { Button } from "@/components/user/ui/button"
import { Slider } from "@/components/user/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/user/ui/select"
import { useChatSettings } from "@/hooks/use-chat-settings"

interface ChatSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function ChatSettings({ isOpen, onClose }: ChatSettingsProps) {
  const { fontSize, fontFamily, setFontSize, setFontFamily } = useChatSettings()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg w-full max-w-md p-6 border border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">채팅 설정</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">글씨 크기: {fontSize}px</label>
            <Slider
              value={[fontSize]}
              min={12}
              max={24}
              step={1}
              onValueChange={(value) => setFontSize(value[0])}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>작게</span>
              <span>크게</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400">글씨체</label>
            <Select value={fontFamily} onValueChange={setFontFamily}>
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="글씨체 선택" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="sans">Sans-serif</SelectItem>
                <SelectItem value="serif">Serif</SelectItem>
                <SelectItem value="mono">Monospace</SelectItem>
                <SelectItem value="noto-sans-kr">Noto Sans KR</SelectItem>
                <SelectItem value="nanum-gothic">나눔 고딕</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-8 p-4 bg-gray-800 rounded-md">
            <p
              className="text-white"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: getFontFamilyValue(fontFamily),
              }}
            >
              안녕하세요! 이것은 글씨 크기와 글씨체 미리보기입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function getFontFamilyValue(fontFamily: string): string {
  switch (fontFamily) {
    case "sans":
      return "ui-sans-serif, system-ui, sans-serif"
    case "serif":
      return "ui-serif, Georgia, serif"
    case "mono":
      return "ui-monospace, SFMono-Regular, monospace"
    case "noto-sans-kr":
      return '"Noto Sans KR", sans-serif'
    case "nanum-gothic":
      return '"Nanum Gothic", sans-serif'
    default:
      return "ui-sans-serif, system-ui, sans-serif"
  }
}
