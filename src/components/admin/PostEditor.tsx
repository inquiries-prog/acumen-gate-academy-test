"use client";

import { useEffect, useRef, useState } from "react";
import {
  EditorContent,
  Extension,
  Mark,
  Node,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  useEditor,
  type Editor,
  type NodeViewProps,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { IMAGE_ACCEPT, uploadAdminImage } from "./ImageField";
import { toPostHtml } from "@/lib/post-html";

/**
 * The Word-style editor for news posts.
 *
 * Toolbar: text style (heading, subheading, normal), bold, italic, underline,
 * strike, small text, bullet and numbered lists, indent / outdent, quote,
 * link, divider, image, undo and redo. Keyboard shortcuts work too (Ctrl+B,
 * Ctrl+I, Ctrl+U, Tab / Shift+Tab to indent, Ctrl+Z).
 *
 * Photos can be inserted with the button, dropped or pasted. Each photo has a
 * caption box and a Remove button right where it sits in the post.
 *
 * The post is saved as HTML in a hidden input. The website sanitises it before
 * showing it (lib/post-render.ts), so only this editor's formatting survives.
 */
export default function PostEditor({
  name,
  value,
  placeholder = "Write the post…",
  folder = "general",
}: {
  name: string;
  value: string;
  placeholder?: string;
  folder?: string;
}) {
  const [html, setHtml] = useState(() => toPostHtml(value));
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<Editor | null>(null);

  async function insertImages(files: File[], pos?: number) {
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (images.length === 0) return;
    setError(null);
    setUploading((n) => n + images.length);
    for (const file of images) {
      try {
        const src = await uploadAdminImage(file, folder);
        const editor = editorRef.current;
        if (!editor) return;
        const at = pos ?? editor.state.selection.from;
        const node = { type: "figure", attrs: { src, caption: "" } };
        if (pos === undefined) editor.chain().focus().insertContent(node).run();
        else editor.chain().focus().insertContentAt(pos, node).run();
        const end = cursorAfterFigure(editor, src, at);
        if (end !== null && pos !== undefined) pos = end;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }
  // The editor's paste/drop handlers are set once, so they call through a ref.
  const insertRef = useRef(insertImages);
  insertRef.current = insertImages;

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      Placeholder.configure({ placeholder }),
      Small,
      Indent,
      Figure,
    ],
    content: html,
    editorProps: {
      attributes: { class: "post-body", "aria-label": "The post" },
      handlePaste: (_view, event) => {
        const files = Array.from(event.clipboardData?.files ?? []);
        if (!files.some((f) => f.type.startsWith("image/"))) return false;
        void insertRef.current(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = Array.from(event.dataTransfer?.files ?? []);
        if (moved || !files.some((f) => f.type.startsWith("image/"))) return false;
        event.preventDefault();
        const at = view.posAtCoords({ left: event.clientX, top: event.clientY });
        void insertRef.current(files, at?.pos);
        return true;
      },
    },
    // The editor keeps an empty line at the end for typing; don't save it.
    onUpdate: ({ editor }) => setHtml(editor.isEmpty ? "" : editor.getHTML().replace(/(<p><\/p>)+$/, "")),
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <div className="post-editor overflow-hidden rounded-lg border border-line bg-white focus-within:border-red/50 focus-within:ring-2 focus-within:ring-red/15">
      <input type="hidden" name={name} value={html} />

      {editor ? (
        <Toolbar editor={editor} onImage={() => fileRef.current?.click()} uploading={uploading > 0} />
      ) : (
        <div className="h-[46px] border-b border-line bg-offwhite" />
      )}

      {error && (
        <p className="border-b border-line bg-red/5 px-4 py-2 text-xs font-semibold text-red" role="alert">
          {error}
        </p>
      )}

      <EditorContent editor={editor} />

      <input
        ref={fileRef}
        type="file"
        multiple
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          void insertImages(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* -------------------------------------------------------------- toolbar */

function Toolbar({ editor, onImage, uploading }: { editor: Editor; onImage: () => void; uploading: boolean }) {
  const style = editor.isActive("heading", { level: 2 })
    ? "h2"
    : editor.isActive("heading", { level: 3 })
      ? "h3"
      : "p";
  const inList = editor.isActive("listItem");
  const c = () => editor.chain().focus();

  function setLink() {
    const current = String(editor.getAttributes("link").href ?? "");
    const url = window.prompt("Link address (leave empty to remove the link)", current || "https://");
    if (url === null) return;
    const href = url.trim();
    if (!href || href === "https://") c().extendMarkRange("link").unsetLink().run();
    else c().extendMarkRange("link").setLink({ href }).run();
  }

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 border-b border-line bg-offwhite px-2 py-1.5"
    >
      <select
        aria-label="Text style"
        value={style}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "p") c().setParagraph().run();
          else c().setHeading({ level: v === "h2" ? 2 : 3 }).run();
        }}
        className="mr-1 h-8 rounded-md border border-line bg-white px-2 text-sm font-semibold text-charcoal"
      >
        <option value="h2">Heading</option>
        <option value="h3">Subheading</option>
        <option value="p">Normal text</option>
      </select>

      <Sep />
      <Btn label="Bold (Ctrl+B)" active={editor.isActive("bold")} onClick={() => c().toggleBold().run()}>
        <b className="font-display text-[15px]">B</b>
      </Btn>
      <Btn label="Italic (Ctrl+I)" active={editor.isActive("italic")} onClick={() => c().toggleItalic().run()}>
        <i className="font-serif text-[15px] font-semibold">I</i>
      </Btn>
      <Btn label="Underline (Ctrl+U)" active={editor.isActive("underline")} onClick={() => c().toggleUnderline().run()}>
        <span className="text-[15px] font-semibold underline underline-offset-2">U</span>
      </Btn>
      <Btn label="Strikethrough" active={editor.isActive("strike")} onClick={() => c().toggleStrike().run()}>
        <span className="text-[15px] font-semibold line-through">S</span>
      </Btn>
      <Btn label="Small text" active={editor.isActive("small")} onClick={() => c().toggleMark("small").run()}>
        <span className="font-semibold">
          <span className="text-[15px]">A</span>
          <span className="text-[10px]">a</span>
        </span>
      </Btn>

      <Sep />
      <Btn label="Bullet list" active={editor.isActive("bulletList")} onClick={() => c().toggleBulletList().run()}>
        <Icon d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
      </Btn>
      <Btn label="Numbered list" active={editor.isActive("orderedList")} onClick={() => c().toggleOrderedList().run()}>
        <Icon d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v5M3.5 14.5a1.5 1.5 0 0 1 3 .5L3.5 19h3" />
      </Btn>
      <Btn
        label="Indent (Tab)"
        disabled={inList ? !editor.can().sinkListItem("listItem") : indentOf(editor) >= MAX_INDENT}
        onClick={() => changeIndent(editor, 1)}
      >
        <Icon d="M4 6h16M11 12h9M11 18h9M4 10l3 2-3 2" />
      </Btn>
      <Btn
        label="Outdent (Shift+Tab)"
        disabled={inList ? !editor.can().liftListItem("listItem") : indentOf(editor) <= 0}
        onClick={() => changeIndent(editor, -1)}
      >
        <Icon d="M4 6h16M11 12h9M11 18h9M7 10l-3 2 3 2" />
      </Btn>

      <Sep />
      <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => c().toggleBlockquote().run()}>
        <Icon d="M7 7h4v4c0 3-1.5 5-4 6M14 7h4v4c0 3-1.5 5-4 6" />
      </Btn>
      <Btn label="Link" active={editor.isActive("link")} onClick={setLink}>
        <Icon d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
      </Btn>
      <Btn label="Divider line" onClick={() => c().setHorizontalRule().run()}>
        <Icon d="M4 12h16" />
      </Btn>
      <button
        type="button"
        onClick={onImage}
        disabled={uploading}
        title="Insert image (or drag / paste a photo into the post)"
        className="ml-0.5 inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-semibold text-charcoal hover:bg-white disabled:opacity-60"
      >
        <Icon d="M4 5h16v14H4zM4 15l4-4 5 5M14 13l2-2 4 4M15.5 8.5h.01" />
        {uploading ? "Uploading…" : "Image"}
      </button>

      <span className="ml-auto flex">
        <Btn label="Undo (Ctrl+Z)" disabled={!editor.can().undo()} onClick={() => c().undo().run()}>
          <Icon d="M9 14L4 9l5-5M4 9h10a6 6 0 0 1 0 12h-3" />
        </Btn>
        <Btn label="Redo (Ctrl+Y)" disabled={!editor.can().redo()} onClick={() => c().redo().run()}>
          <Icon d="M15 14l5-5-5-5M20 9H10a6 6 0 0 0 0 12h3" />
        </Btn>
      </span>
    </div>
  );
}

function Btn({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keep the text selection: a button press would otherwise steal focus first.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`grid h-8 w-8 place-items-center rounded-md text-charcoal transition-colors disabled:opacity-35 ${
        active ? "bg-red/10 text-red" : "hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}

const Sep = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-line" />;

function Icon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * After inserting a photo, put the cursor at the start of the line below it
 * (adding an empty line if a photo, list or the end of the post follows), so
 * typing carries on after the photo instead of replacing it.
 * Returns the position just after the photo.
 */
function cursorAfterFigure(editor: Editor, src: string, near: number): number | null {
  let best: { pos: number; size: number } | null = null;
  editor.state.doc.descendants((n, p) => {
    if (n.type.name === "figure" && n.attrs.src === src && (!best || Math.abs(p - near) < Math.abs(best.pos - near))) {
      best = { pos: p, size: n.nodeSize };
    }
    return n.type.name !== "figure";
  });
  if (!best) return null;
  const { pos, size } = best as { pos: number; size: number };
  const end = pos + size;
  const next = editor.state.doc.nodeAt(end);
  const chain = editor.chain().focus();
  if (!next || !next.isTextblock) chain.insertContentAt(end, { type: "paragraph" });
  chain.setTextSelection(end + 1).scrollIntoView().run();
  return end;
}

/* ----------------------------------------------------------- extensions */

/** Smaller text inside a paragraph (<small>), for notes and fine print. */
const Small = Mark.create({
  name: "small",
  parseHTML: () => [{ tag: "small" }],
  renderHTML: ({ HTMLAttributes }) => ["small", HTMLAttributes, 0],
});

const MAX_INDENT = 4;
const INDENTED = ["paragraph", "heading"];

function indentOf(editor: Editor): number {
  const type = editor.isActive("heading") ? "heading" : "paragraph";
  return Number(editor.getAttributes(type).indent) || 0;
}

/** Lists nest; other paragraphs get a left indent (up to four steps). */
function changeIndent(editor: Editor, delta: 1 | -1): boolean {
  if (editor.isActive("listItem")) {
    return delta > 0
      ? editor.chain().focus().sinkListItem("listItem").run()
      : editor.chain().focus().liftListItem("listItem").run();
  }
  const next = Math.max(0, Math.min(MAX_INDENT, indentOf(editor) + delta));
  let chain = editor.chain().focus();
  for (const type of INDENTED) chain = chain.updateAttributes(type, { indent: next });
  return chain.run();
}

const Indent = Extension.create({
  name: "indent",
  addGlobalAttributes: () => [
    {
      types: INDENTED,
      attributes: {
        indent: {
          default: 0,
          parseHTML: (el) => Math.min(MAX_INDENT, Number(el.getAttribute("data-indent")) || 0),
          renderHTML: (attrs) => (attrs.indent ? { "data-indent": attrs.indent } : {}),
        },
      },
    },
  ],
  addKeyboardShortcuts() {
    return {
      Tab: () => changeIndent(this.editor, 1) || true,
      "Shift-Tab": () => changeIndent(this.editor, -1) || true,
    };
  },
});

/** A photo with an optional caption, as <figure><img><figcaption>. */
const Figure = Node.create({
  name: "figure",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes: () => ({
    src: { default: "" },
    caption: { default: "" },
  }),
  parseHTML: () => [
    {
      tag: "figure",
      getAttrs: (el) => {
        const src = el.querySelector("img")?.getAttribute("src") ?? "";
        if (!src || src.startsWith("data:")) return false;
        return {
          src,
          caption: el.querySelector("figcaption")?.textContent ?? el.querySelector("img")?.getAttribute("alt") ?? "",
        };
      },
    },
    {
      tag: "img[src]",
      getAttrs: (el) => {
        const src = el.getAttribute("src") ?? "";
        return src.startsWith("data:") ? false : { src, caption: el.getAttribute("alt") ?? "" };
      },
    },
  ],
  renderHTML: ({ node }) => {
    const { src, caption } = node.attrs as { src: string; caption: string };
    const text = caption.trim();
    return text
      ? ["figure", {}, ["img", { src, alt: text }], ["figcaption", {}, text]]
      : ["figure", {}, ["img", { src, alt: "" }]];
  },
  addNodeView: () => ReactNodeViewRenderer(FigureView),
});

function FigureView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
  const { src, caption } = node.attrs as { src: string; caption: string };
  return (
    <NodeViewWrapper as="figure" contentEditable={false} data-drag-handle="" className={selected ? "rounded-2xl ring-2 ring-red/60" : ""}>
      {/* Plain <img>: previews an arbitrary just-uploaded URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={caption} draggable={false} />
      <div className="mx-auto mt-2 flex max-w-xl items-center gap-2">
        <input
          type="text"
          value={caption}
          onChange={(e) => updateAttributes({ caption: e.target.value })}
          placeholder="Caption (optional)"
          aria-label="Photo caption"
          className="field !min-h-9 flex-1 !py-1 text-center text-sm"
        />
        <button type="button" onClick={deleteNode} className="btn-ghost shrink-0 text-sm text-red hover:bg-red/5">
          Remove
        </button>
      </div>
    </NodeViewWrapper>
  );
}
