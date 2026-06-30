import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code2,
  Eraser,
  Italic,
  List,
  ListOrdered,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import TextAlign from "@tiptap/extension-text-align"
import Underline from "@tiptap/extension-underline"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

type RichTextMode = "design" | "html" | "preview"
type TextStyleOption = "paragraph" | "heading-1" | "heading-2" | "heading-3" | "heading-4" | "heading-5" | "heading-6"

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  minHeightClassName?: string
  className?: string
  onClear?: () => void
  previewLabel?: ReactNode
}

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={active
        ? "bg-background text-primary shadow-xs hover:bg-background"
        : "text-muted-foreground hover:bg-background hover:text-foreground"
      }
    >
      {children}
    </Button>
  )
}

function getCurrentTextStyle(editor: NonNullable<ReturnType<typeof useEditor>>): TextStyleOption {
  for (const level of [1, 2, 3, 4, 5, 6] as const) {
    if (editor.isActive("heading", { level })) {
      return `heading-${level}` as TextStyleOption
    }
  }

  return "paragraph"
}

export function RichTextEditor({
  value,
  onChange,
  minHeightClassName = "min-h-[22rem]",
  className,
  onClear,
  previewLabel,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<RichTextMode>("design")
  const [textStyle, setTextStyle] = useState<TextStyleOption>("paragraph")

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-4 py-4 text-foreground outline-none dark:prose-invert",
          minHeightClassName,
          "[&_h1]:mt-2 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-semibold",
          "[&_h2]:mt-2 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h5]:mt-2 [&_h5]:mb-2 [&_h5]:text-base [&_h5]:font-semibold [&_h6]:mt-2 [&_h6]:mb-2 [&_h6]:text-sm [&_h6]:font-semibold",
          "[&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3"
        ),
      },
    },
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    const normalizedValue = value || "<p></p>"
    if (editor.getHTML() !== normalizedValue) {
      editor.commands.setContent(normalizedValue, { emitUpdate: false })
    }
  }, [editor, value])

  useEffect(() => {
    if (!editor) {
      return
    }

    const updateTextStyle = () => {
      setTextStyle(getCurrentTextStyle(editor))
    }

    updateTextStyle()
    editor.on("selectionUpdate", updateTextStyle)
    editor.on("transaction", updateTextStyle)

    return () => {
      editor.off("selectionUpdate", updateTextStyle)
      editor.off("transaction", updateTextStyle)
    }
  }, [editor])

  function handleTextStyleChange(nextValue: TextStyleOption) {
    if (!editor) {
      return
    }

    setTextStyle(nextValue)

    if (nextValue === "paragraph") {
      editor.chain().focus().setParagraph().run()
      return
    }

    const headingLevel = Number(nextValue.replace("heading-", "")) as 1 | 2 | 3 | 4 | 5 | 6
    editor.chain().focus().setHeading({ level: headingLevel }).run()
  }

  const modeTabs = useMemo(
    () => [
      { id: "design", label: "Design" },
      { id: "html", label: "HTML" },
      { id: "preview", label: "Preview" },
    ] satisfies Array<{ id: RichTextMode; label: string }>,
    []
  )

  return (
    <div className={cn("overflow-hidden rounded-lg border border-border bg-background shadow-sm", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b border-border/70 bg-muted/20 p-2">
        <ToolbarButton
          label="Undo"
          disabled={!editor?.can().chain().focus().undo().run()}
          onClick={() => editor?.chain().focus().undo().run()}
        >
          <Undo2 className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          disabled={!editor?.can().chain().focus().redo().run()}
          onClick={() => editor?.chain().focus().redo().run()}
        >
          <Redo2 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <Select
          value={textStyle}
          onValueChange={(nextValue) => handleTextStyleChange(nextValue as TextStyleOption)}
        >
          <SelectTrigger
            size="sm"
            className="w-36 bg-background text-left"
            aria-label="Text style"
            disabled={!editor}
          >
            <SelectValue placeholder="Text style" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="paragraph">Text</SelectItem>
            <SelectItem value="heading-1">Heading 1</SelectItem>
            <SelectItem value="heading-2">Heading 2</SelectItem>
            <SelectItem value="heading-3">Heading 3</SelectItem>
            <SelectItem value="heading-4">Heading 4</SelectItem>
            <SelectItem value="heading-5">Heading 5</SelectItem>
            <SelectItem value="heading-6">Heading 6</SelectItem>
          </SelectContent>
        </Select>
        <ToolbarButton
          label="Bold"
          active={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          <Bold className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          active={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Underline"
          active={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bullet list"
          active={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          <List className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          active={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Code block"
          active={editor?.isActive("codeBlock")}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
        >
          <Code2 className="size-4" />
        </ToolbarButton>

        <div className="mx-1 h-5 w-px bg-border" />

        <ToolbarButton
          label="Align left"
          active={editor?.isActive({ textAlign: "left" })}
          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align center"
          active={editor?.isActive({ textAlign: "center" })}
          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Align right"
          active={editor?.isActive({ textAlign: "right" })}
          onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-4" />
        </ToolbarButton>

        <div className="ml-auto flex items-center gap-2">
          {onClear ? (
            <Button type="button" variant="ghost" size="sm" onClick={onClear} className="text-muted-foreground">
              <Eraser className="mr-1.5 size-4" />
              Delete All
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border/70 bg-muted/30 px-3 py-2">
        <div role="tablist" aria-label="Editor view mode" className="inline-flex rounded-sm border border-border bg-background p-0.5">
          {modeTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={mode === tab.id}
              onClick={() => setMode(tab.id)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-sm font-medium transition-colors",
                mode === tab.id
                  ? "bg-muted text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground">
          {previewLabel}
        </div>
      </div>

      {mode === "design" ? (
        <div className="bg-background">
          <EditorContent editor={editor} />
        </div>
      ) : null}

      {mode === "html" ? (
        <div className="bg-background p-3">
          <Textarea
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={cn("font-mono text-xs leading-6", minHeightClassName)}
          />
        </div>
      ) : null}

      {mode === "preview" ? (
        <div className="bg-background px-4 py-4">
          <div
            className={cn(
              "prose prose-sm max-w-none text-foreground dark:prose-invert",
              minHeightClassName,
              "[&_h1]:mt-2 [&_h1]:mb-3 [&_h1]:text-3xl [&_h1]:font-semibold",
              "[&_h2]:mt-2 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:mt-2 [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h4]:mt-2 [&_h4]:mb-2 [&_h4]:text-lg [&_h4]:font-semibold [&_h5]:mt-2 [&_h5]:mb-2 [&_h5]:text-base [&_h5]:font-semibold [&_h6]:mt-2 [&_h6]:mb-2 [&_h6]:text-sm [&_h6]:font-semibold",
              "[&_p]:my-3 [&_ul]:my-3 [&_ol]:my-3"
            )}
            dangerouslySetInnerHTML={{
              __html: value || "<p class=\"text-muted-foreground\">No content available.</p>",
            }}
          />
        </div>
      ) : null}
    </div>
  )
}


