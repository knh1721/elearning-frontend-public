"use client"

import "@toast-ui/editor/dist/toastui-editor.css"
import { Editor } from "@toast-ui/react-editor"
import { useRef, useEffect } from "react"

interface Props {
  value: string
  onChange: (value: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editorRef = useRef<any>(null)
  useEffect(() => {
    if (editorRef.current) {
      const editorInstance = editorRef.current.getInstance()

      if (!value || value.trim() === "") {
        editorInstance.setMarkdown("")
      } else {
        editorInstance.setMarkdown(value)
      }
    }
  }, [value])
  useEffect(() => {
    const injectStyle = () => {
      if (document.head.querySelector("[data-toast-style]")) return

      const style = document.createElement("style")
      style.setAttribute("data-toast-style", "true")
      style.innerHTML = `
        .toastui-editor-mode-switch {
          display: none !important;
        }

        .toastui-editor-toolbar button {
          color: #cbd5e1 !important;
          border: 1px solid #475569 !important;
          box-shadow: none !important;
        }

        .toastui-editor-toolbar {
          border-bottom: 1px solid #334155 !important;
        }

        .toastui-editor-defaultUI {
          background-color: #0f172a !important;
          border: 1px solid #334155 !important;
          border-radius: 0.5rem !important;
          padding: 1rem !important;
        }

        .toastui-editor-defaultUI .toastui-editor-contents,
        .toastui-editor-defaultUI .ProseMirror,
        .toastui-editor-defaultUI .toastui-editor-contents *,
        .toastui-editor-defaultUI .ProseMirror * {
          color: #ffffff !important;
          font-weight: 500 !important;
          line-height: 1.7 !important;
          letter-spacing: 0.01em !important;
        }

        .toastui-editor-defaultUI pre,
        .toastui-editor-defaultUI blockquote {
          color: #f8fafc !important;
        }

        .toastui-editor-toolbar-icons {
          color: #e2e8f0 !important;
        }

        .toastui-editor-toolbar-icons:hover,
        .toastui-editor-toolbar-icons:focus {
          background-color: #334155 !important;
        }

        .toastui-editor-toolbar-divider {
          background-color: #334155 !important;
        }

        .toastui-editor-md-tab-container {
          background-color: #1e293b !important;
        }

        .toastui-editor-md-tab-container .tab-item {
          color: #cbd5e1 !important;
        }

        .toastui-editor-md-tab-container .tab-item.active {
          color: #ffffff !important;
          font-weight: bold !important;
          border-bottom: 2px solid #1d4ed8 !important;
        }

        #toastuiAltTextInput,
        #toastuiImageUrlInput,
        #toastuiImageDescriptionInput {
          background-color: #ffffff !important;
          color: #000000 !important;
          font-weight: 500 !important;
          border: 1px solid #d1d5db !important;
          padding: 0.5rem !important;
        }

        .toastui-editor-popup-add-heading li {
          background-color: #ffffff !important;
          color: #000000 !important;
          font-weight: 500 !important;
          padding: 0.5rem !important;
          border: 1px solid #d1d5db !important;
          border-radius: 0.25rem !important;
        }

        .toastui-editor-popup-add-heading li:hover {
          background-color: #e2e8f0 !important;
        }

        .toastui-editor-defaultUI .tui-dialog-footer .tui-dialog-button {
          background-color: #1d4ed8 !important;
          color: white !important;
          border: none !important;
        }

        .toastui-editor-defaultUI .tui-dialog-footer .tui-dialog-button:hover {
          background-color: #2563eb !important;
        }

        .toastui-editor-defaultUI .tui-dialog-close {
          color: #e2e8f0 !important;
        }
      `
      document.head.appendChild(style)
    }

    const applyPopupFixes = () => {
      const selectors = [
        "#toastuiAltTextInput",
        "#toastuiImageUrlInput",
        "#toastuiImageDescriptionInput",
        ".toastui-editor-popup-add-heading li",
      ]

      selectors.forEach((selector) => {
        const elements = document.querySelectorAll(selector)
        elements.forEach((el) => {
          const elem = el as HTMLElement
          elem.style.backgroundColor = "#ffffff"
          elem.style.color = "#000000"
          elem.style.fontWeight = "500"
          elem.style.border = "1px solid #d1d5db"
          elem.style.padding = "0.5rem"
        })
      })
    }

    requestAnimationFrame(() => {
      injectStyle()
      setTimeout(() => {
        applyPopupFixes()
      }, 300)
    })

    const observer = new MutationObserver(() => {
      setTimeout(() => {
        applyPopupFixes()
      }, 150)
    })

    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      const prev = document.head.querySelector("[data-toast-style]")
      if (prev) document.head.removeChild(prev)
      observer.disconnect()
    }
  }, [])

  const handleImageUpload = async (
    blob: Blob,
    callback: (url: string, altText: string) => void
  ) => {
    const res = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: (blob as File).name,
        fileType: blob.type,
      }),
    })

    const { uploadUrl, fileUrl } = await res.json()

    await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": blob.type },
      body: blob,
    })

    callback(fileUrl, "image")
  }

  return (
    <div className="rounded overflow-hidden">
      <Editor
        ref={editorRef}
        height="400px"
        initialEditType="markdown"
        previewStyle="vertical"
        initialValue=""
        placeholder="강의 내용을 입력하세요..."
        hooks={{ addImageBlobHook: handleImageUpload }}
        onChange={() => {
          const markdown = editorRef.current?.getInstance().getMarkdown()
          onChange(markdown)
        }}
      />
    </div>
  )
}
