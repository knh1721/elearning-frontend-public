"use client"

import dynamic from "next/dynamic"
import MarkdownIt from "markdown-it"
import "react-markdown-editor-lite/lib/index.css"

const MdEditor = dynamic(() => import("react-markdown-editor-lite"), { ssr: false })

const mdParser = new MarkdownIt()

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg text-white">
        <MdEditor
          value={value}
          style={{ height: "500px" }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={({ text }) => onChange(text)}
          config={{
            view: {
              menu: true,
              md: true,
              html: false, // 미리보기 창 안 보이게
            },
            shortcuts: true,
            toolbar: [
              'bold',
              'italic',
              'strike',
              'link',
              'quote',
              '|',
              'unordered-list',
              'ordered-list',
              '|',
              'image',
              'code',
              '|',
              'preview',
              'fullscreen',
            ]
          }}
        />
      </div>
  )
}