import { useState, useRef, KeyboardEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  GripVertical, 
  Type, 
  Heading1, 
  Heading2, 
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Trash2,
  Minus,
  Code,
  FileText,
  Table,
  PlusCircle,
  X,
  ChevronRight,
  Image,
  Link2,
  Calculator,
  BarChart3,
  Play,
  Columns,
  ExternalLink,
  Copy,
  Check,
  Paperclip,
  Music,
  GitBranch,
  Kanban,
  Star,
  Lightbulb,
  Globe,
  Database,
  Share2,
  ImagePlus,
  Timer,
  Sparkles,
  AlertCircle,
  Calendar,
  Pause,
  Volume2,
  ZoomIn,
} from "lucide-react";
import { NoteBlock, FlashcardItem } from "@/contexts/NotesContext";
import ImageLightbox from "./ImageLightbox";
import MindMap from "./MindMap";
import FlashcardBlock from "./FlashcardBlock";
import FlashcardStudyMode from "./FlashcardStudyMode";
import ChartBlock from "./ChartBlock";

interface NotionEditorProps {
  blocks: NoteBlock[];
  onChange: (blocks: NoteBlock[]) => void;
}

const blockTypes = [
  { type: "text", icon: Type, label: "Text", description: "Plain text block", category: "basic" },
  { type: "heading1", icon: Heading1, label: "Heading 1", description: "Large section heading", category: "basic" },
  { type: "heading2", icon: Heading2, label: "Heading 2", description: "Medium section heading", category: "basic" },
  { type: "heading3", icon: Heading3, label: "Heading 3", description: "Small section heading", category: "basic" },
  { type: "divider" as const, icon: Minus, label: "Divider", description: "Visual separator", category: "basic" },
  { type: "bullet", icon: List, label: "Bullet List", description: "Create a bullet list", category: "lists" },
  { type: "numbered", icon: ListOrdered, label: "Numbered List", description: "Create a numbered list", category: "lists" },
  { type: "todo", icon: CheckSquare, label: "To-do", description: "Track tasks with checkboxes", category: "lists" },
  { type: "toggle" as const, icon: ChevronRight, label: "Toggle", description: "Collapsible content", category: "lists" },
  { type: "quote", icon: Quote, label: "Quote", description: "Capture a quote", category: "media" },
  { type: "code" as const, icon: Code, label: "Code Block", description: "Display code snippet", category: "media" },
  { type: "callout" as const, icon: FileText, label: "Callout", description: "Highlight important info", category: "media" },
  { type: "image" as const, icon: Image, label: "Image", description: "Embed an image", category: "media" },
  { type: "bookmark" as const, icon: Link2, label: "Bookmark", description: "Save a web link", category: "media" },
  { type: "video" as const, icon: Play, label: "Video", description: "Embed YouTube video", category: "media" },
  { type: "audio" as const, icon: Music, label: "Audio", description: "Embed audio file", category: "media" },
  { type: "file" as const, icon: Paperclip, label: "File", description: "Attach a file link", category: "media" },
  { type: "gallery" as const, icon: ImagePlus, label: "Gallery", description: "Image gallery grid", category: "media" },
  { type: "table" as const, icon: Table, label: "Table", description: "Add rows & columns", category: "advanced" },
  { type: "equation" as const, icon: Calculator, label: "Equation", description: "Math formula", category: "advanced" },
  { type: "progress" as const, icon: BarChart3, label: "Progress", description: "Visual progress bar", category: "advanced" },
  { type: "columns" as const, icon: Columns, label: "Columns", description: "Side-by-side layout", category: "advanced" },
  { type: "timeline" as const, icon: GitBranch, label: "Timeline", description: "Track milestones", category: "advanced" },
  { type: "kanban" as const, icon: Kanban, label: "Kanban", description: "Task board", category: "advanced" },
  { type: "rating" as const, icon: Star, label: "Rating", description: "Star rating", category: "advanced" },
  { type: "countdown" as const, icon: Timer, label: "Countdown", description: "Timer to date", category: "advanced" },
  { type: "embed" as const, icon: Globe, label: "Embed", description: "External embed", category: "advanced" },
  { type: "database" as const, icon: Database, label: "Database", description: "Mini database", category: "advanced" },
  { type: "mindmap" as const, icon: Share2, label: "Mind Map", description: "Interactive mind map", category: "advanced" },
  { type: "flashcard" as const, icon: Lightbulb, label: "Flashcards", description: "Quick revision cards", category: "advanced" },
  { type: "chart" as const, icon: BarChart3, label: "Chart", description: "Data visualization charts", category: "advanced" },
] as const;

const progressColors = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Orange", value: "bg-orange-500" },
  { name: "Pink", value: "bg-pink-500" },
];

const timelineColors = ["bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500", "bg-pink-500"];

const NotionEditor = ({ blocks, onChange }: NotionEditorProps) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [menuFilter, setMenuFilter] = useState("");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<{ url: string; caption?: string }[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [studyModeBlock, setStudyModeBlock] = useState<NoteBlock | null>(null);
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [dragOverBlockId, setDragOverBlockId] = useState<string | null>(null);
  const blockRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const contentRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const dragYRef = useRef(0);

  const updateBlock = (id: string, updates: Partial<NoteBlock>) => {
    onChange(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const openLightbox = (images: { url: string; caption?: string }[], startIndex = 0) => {
    setLightboxImages(images);
    setLightboxIndex(startIndex);
    setLightboxOpen(true);
  };

  const addBlockAfter = (afterId: string, type: NoteBlock["type"] = "text") => {
    const newBlock: NoteBlock = {
      id: crypto.randomUUID(),
      type,
      content: type === "divider" ? "---" : "",
      checked: type === "todo" ? false : undefined,
      tableData: type === "table" ? [["", "", ""], ["", "", ""], ["", "", ""]] : undefined,
      isExpanded: type === "toggle" ? true : undefined,
      toggleContent: type === "toggle" ? "" : undefined,
      progressValue: type === "progress" ? 50 : undefined,
      progressColor: type === "progress" ? "bg-blue-500" : undefined,
      columns: type === "columns" ? [[{ id: crypto.randomUUID(), type: "text", content: "" }], [{ id: crypto.randomUUID(), type: "text", content: "" }]] : undefined,
      columnTitles: type === "columns" ? ["Column 1", "Column 2"] : undefined,
      // New block type defaults
      timelineItems: type === "timeline" ? [{ id: crypto.randomUUID(), title: "Milestone 1", description: "Description", date: new Date().toISOString().split('T')[0], color: "bg-blue-500" }] : undefined,
      kanbanColumns: type === "kanban" ? [
        { id: crypto.randomUUID(), title: "To Do", cards: [{ id: crypto.randomUUID(), content: "New task" }] },
        { id: crypto.randomUUID(), title: "In Progress", cards: [] },
        { id: crypto.randomUUID(), title: "Done", cards: [] }
      ] : undefined,
      ratingValue: type === "rating" ? 3 : undefined,
      ratingMax: type === "rating" ? 5 : undefined,
      countdownDate: type === "countdown" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
      countdownTitle: type === "countdown" ? "Countdown" : undefined,
      databaseRows: type === "database" ? [{ id: crypto.randomUUID(), cells: { name: "", status: "", date: "" } }] : undefined,
      databaseColumns: type === "database" ? [
        { id: "name", name: "Name", type: "text" },
        { id: "status", name: "Status", type: "select" },
        { id: "date", name: "Date", type: "date" }
      ] : undefined,
      mindMapNodes: type === "mindmap" ? [{ id: crypto.randomUUID(), text: "Central Idea", x: 150, y: 150, color: "bg-blue-500" }] : undefined,
      mindMapConnections: type === "mindmap" ? [] : undefined,
      galleryImages: type === "gallery" ? [] : undefined,
      chartType: type === "chart" ? "bar" : undefined,
      chartTitle: type === "chart" ? "My Chart" : undefined,
      chartColumns: type === "chart" ? [
        { id: crypto.randomUUID(), key: "name", type: "text" },
        { id: crypto.randomUUID(), key: "value", type: "number" },
      ] : undefined,
      chartRows: type === "chart" ? [
        { id: crypto.randomUUID(), cells: { name: "Jan", value: 400 } },
        { id: crypto.randomUUID(), cells: { name: "Feb", value: 300 } },
        { id: crypto.randomUUID(), cells: { name: "Mar", value: 200 } },
        { id: crypto.randomUUID(), cells: { name: "Apr", value: 278 } },
        { id: crypto.randomUUID(), cells: { name: "May", value: 189 } },
      ] : undefined,
      chartXAxisKey: type === "chart" ? "name" : undefined,
      chartSelectedSeries: type === "chart" ? ["value"] : undefined,
      chartSeriesColors: type === "chart" ? { value: "#3b82f6" } : undefined,
    };
    const index = blocks.findIndex((b) => b.id === afterId);
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
    setShowMenu(null);
    setMenuFilter("");
    
    setTimeout(() => {
      const el = blockRefs.current.get(newBlock.id);
      if (el) {
        const input = el.querySelector('[contenteditable], input');
        if (input) (input as HTMLElement).focus();
      }
    }, 10);
  };

  const updateTableCell = (blockId: string, rowIndex: number, colIndex: number, value: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.tableData) return;
    
    const newTableData = block.tableData.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    updateBlock(blockId, { tableData: newTableData });
  };

  const addTableRow = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.tableData) return;
    
    const cols = block.tableData[0]?.length || 3;
    const newRow = Array(cols).fill("");
    updateBlock(blockId, { tableData: [...block.tableData, newRow] });
  };

  const addTableColumn = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.tableData) return;
    
    const newTableData = block.tableData.map(row => [...row, ""]);
    updateBlock(blockId, { tableData: newTableData });
  };

  const deleteTableRow = (blockId: string, rowIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.tableData || block.tableData.length <= 1) return;
    
    const newTableData = block.tableData.filter((_, idx) => idx !== rowIndex);
    updateBlock(blockId, { tableData: newTableData });
  };

  const deleteTableColumn = (blockId: string, colIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block?.tableData || block.tableData[0]?.length <= 1) return;
    
    const newTableData = block.tableData.map(row => row.filter((_, idx) => idx !== colIndex));
    updateBlock(blockId, { tableData: newTableData });
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const index = blocks.findIndex((b) => b.id === id);
    const newBlocks = blocks.filter((b) => b.id !== id);
    onChange(newBlocks);
    
    if (index > 0) {
      setTimeout(() => {
        const prevBlock = newBlocks[index - 1];
        const el = blockRefs.current.get(prevBlock.id);
        if (el) {
          const input = el.querySelector('[contenteditable], input');
          if (input) (input as HTMLElement).focus();
        }
      }, 10);
    }
  };

  const handleKeyDown = (e: KeyboardEvent, block: NoteBlock) => {
    // Don't prevent formatting shortcuts
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    if (modKey && ['b', 'i', 'u', 'e', 'k', 's', '\\'].includes(e.key.toLowerCase())) {
      return; // Let the formatting hook handle it
    }

    const contentEl = contentRefs.current.get(block.id);
    const isEmpty = contentEl ? (contentEl.textContent || "").trim() === "" : block.content === "";

    // Handle Enter key
    if (e.key === "Enter" && !e.shiftKey) {
      // For code blocks: allow new lines (Shift+Enter to exit)
      if (block.type === "code") {
        return; // Allow native Enter behavior for new lines
      }

      // For lists, todos, bullets: exit on empty second press
      if (block.type === "bullet" || block.type === "numbered" || block.type === "todo") {
        if (isEmpty) {
          // Empty list item: delete it and create a new text block
          e.preventDefault();
          const index = blocks.findIndex((b) => b.id === block.id);
          const newBlocks = blocks.filter((b) => b.id !== block.id);

          // Add a new text block at the same position
          const newBlock: NoteBlock = {
            id: crypto.randomUUID(),
            type: "text",
            content: "",
          };
          newBlocks.splice(index, 0, newBlock);
          onChange(newBlocks);

          // Focus the new text block
          setTimeout(() => {
            const el = blockRefs.current.get(newBlock.id);
            if (el) {
              const input = el.querySelector('[contenteditable], input');
              if (input) (input as HTMLElement).focus();
            }
          }, 10);
        } else {
          // Non-empty: create new list item
          e.preventDefault();
          addBlockAfter(block.id, block.type);
        }
        return;
      }

      // For other blocks: normal behavior
      e.preventDefault();
      addBlockAfter(block.id, "text");
    }

    // Handle Shift+Enter: exit code blocks or create new line in other blocks
    if (e.key === "Enter" && e.shiftKey && block.type === "code") {
      e.preventDefault();
      addBlockAfter(block.id, "text");
      return;
    }

    if (e.key === "Backspace" && isEmpty && blocks.length > 1) {
      e.preventDefault();
      deleteBlock(block.id);
    }
    if (e.key === "/" && isEmpty) {
      e.preventDefault();
      setShowMenu(block.id);
      setMenuFilter("");
    }
    if (e.key === "Escape") {
      setShowMenu(null);
      setMenuFilter("");
    }
  };

  // Helper function to extract text from contentEditable while preserving line breaks
  const extractContentFromEditable = (el: HTMLElement): string => {
    // Use innerText which respects visual line breaks, then clean up
    return (el.innerText || el.textContent || "").trimEnd();
  };

  const handleContentInput = (block: NoteBlock, el: HTMLDivElement) => {
    const text = el.textContent || "";
    updateBlock(block.id, { content: text });
  };

  const copyCodeToClipboard = async (blockId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedCode(blockId);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getVideoEmbedUrl = (url: string) => {
    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    return null;
  };

  const getBlockStyle = (type: NoteBlock["type"]) => {
    switch (type) {
      case "heading1":
        return "text-3xl font-bold tracking-tight";
      case "heading2":
        return "text-2xl font-semibold tracking-tight";
      case "heading3":
        return "text-xl font-medium";
      case "quote":
        return "border-l-4 border-primary pl-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r-lg";
      case "code":
        return "font-mono text-sm bg-zinc-900 text-green-400 p-4 rounded-lg border border-zinc-700 whitespace-pre-wrap";
      case "callout":
        return "bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg";
      case "equation":
        return "font-mono text-lg bg-muted/30 p-4 rounded-lg text-center border border-border";
      default:
        return "text-base";
    }
  };

  const getNumberedIndex = (blockId: string) => {
    let count = 0;
    for (const block of blocks) {
      if (block.type === "numbered") count++;
      if (block.id === blockId) return count;
    }
    return 1;
  };

  const filteredBlockTypes = blockTypes.filter(
    (bt) =>
      bt.label.toLowerCase().includes(menuFilter.toLowerCase()) ||
      bt.description.toLowerCase().includes(menuFilter.toLowerCase())
  );

  const handleBlockDragStart = (blockId: string, clientY: number) => {
    setDraggedBlockId(blockId);
    setShowMenu(null);
    dragYRef.current = clientY;
  };

  const handleBlockDragEnd = (draggedId: string) => {
    if (dragOverBlockId && dragOverBlockId !== draggedId) {
      reorderBlocks(draggedId, dragOverBlockId);
    }
    setDraggedBlockId(null);
    setDragOverBlockId(null);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!draggedBlockId) return;

    // Find which block the pointer is over
    let foundBlock = false;
    blocks.forEach((block) => {
      const element = blockRefs.current.get(block.id);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const isOver =
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom &&
        block.id !== draggedBlockId;

      if (isOver && !foundBlock) {
        setDragOverBlockId(block.id);
        foundBlock = true;
      }
    });

    // Clear dragOverBlockId if not over any block
    if (!foundBlock) {
      setDragOverBlockId(null);
    }
  };

  const reorderBlocks = (draggedId: string, targetId: string) => {
    const draggedIndex = blocks.findIndex(b => b.id === draggedId);
    const targetIndex = blocks.findIndex(b => b.id === targetId);

    if (draggedIndex === -1 || targetIndex === -1 || draggedIndex === targetIndex) {
      return;
    }

    const newBlocks = [...blocks];
    const [draggedBlock] = newBlocks.splice(draggedIndex, 1);

    if (draggedIndex < targetIndex) {
      newBlocks.splice(targetIndex - 1, 0, draggedBlock);
    } else {
      newBlocks.splice(targetIndex, 0, draggedBlock);
    }

    onChange(newBlocks);
  };

  // Track content refs to avoid re-renders resetting cursor
  const initializedRefs = useRef<Set<string>>(new Set());
  const currentBlockIds = useRef<string>("");

  // Clear initialized refs when blocks change (switching notes)
  useEffect(() => {
    const blockIds = blocks.map(b => b.id).join(",");
    if (currentBlockIds.current !== blockIds) {
      initializedRefs.current.clear();
      currentBlockIds.current = blockIds;
    }
  }, [blocks]);

  // Add pointer move and up listeners for drag detection
  useEffect(() => {
    if (!draggedBlockId) return;

    const handlePointerUp = () => {
      handleBlockDragEnd(draggedBlockId);
    };

    window.addEventListener("pointermove", handlePointerMove as EventListener);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove as EventListener);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [draggedBlockId, blocks, dragOverBlockId]);

  // Render editable content with formatting preserved - NO children to avoid cursor reset
  const renderEditableContent = (block: NoteBlock) => {
    return (
      <div
        ref={(el) => {
          if (el) {
            contentRefs.current.set(block.id, el);
            // Only set content on first mount to avoid cursor reset
            if (!initializedRefs.current.has(block.id)) {
              el.textContent = block.content || "";
              initializedRefs.current.add(block.id);
            }
          }
        }}
        contentEditable
        suppressContentEditableWarning
        onBlur={(e) => {
          const text = e.currentTarget.textContent || "";
          if (text !== block.content) {
            updateBlock(block.id, { content: text });
          }
        }}
        onKeyDown={(e) => handleKeyDown(e, block)}
        className={`outline-none py-1 transition-all ${getBlockStyle(block.type)} empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40`}
        data-placeholder={
          block.type === "heading1" ? "Heading 1" : 
          block.type === "heading2" ? "Heading 2" : 
          block.type === "heading3" ? "Heading 3" : 
          block.type === "quote" ? "Write a quote..." : 
          block.type === "code" ? "Write code..." :
          block.type === "callout" ? "Write a callout..." :
          block.type === "equation" ? "E = mc²" :
          "Type '/' for commands, or start writing..."
        }
      />
    );
  };

  const renderBlock = (block: NoteBlock) => {
    switch (block.type) {
      case "divider":
        return (
          <div className="py-3">
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        );

      case "todo":
        return (
          <div className="flex items-start gap-3 py-1">
            <motion.div
              className="mt-1"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <input
                type="checkbox"
                checked={block.checked}
                onChange={(e) => updateBlock(block.id, { checked: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-muted-foreground/30 accent-primary cursor-pointer transition-all checked:border-primary"
              />
            </motion.div>
            <div
              ref={(el) => {
                if (el) {
                  contentRefs.current.set(block.id, el);
                  if (!initializedRefs.current.has(block.id)) {
                    el.textContent = block.content || "";
                    initializedRefs.current.add(block.id);
                  }
                }
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent || "";
                if (text !== block.content) {
                  updateBlock(block.id, { content: text });
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, block)}
              className={`flex-1 outline-none transition-all ${block.checked ? 'line-through text-muted-foreground/50' : ''}`}
              data-placeholder="To-do"
            />
          </div>
        );

      case "bullet":
        return (
          <div className="flex items-start gap-3 py-1">
            <span className="mt-2.5 w-2 h-2 rounded-full bg-primary/60 flex-shrink-0" />
            <div
              ref={(el) => {
                if (el) {
                  contentRefs.current.set(block.id, el);
                  if (!initializedRefs.current.has(block.id)) {
                    el.textContent = block.content || "";
                    initializedRefs.current.add(block.id);
                  }
                }
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent || "";
                if (text !== block.content) {
                  updateBlock(block.id, { content: text });
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, block)}
              className="flex-1 outline-none"
              data-placeholder="List item"
            />
          </div>
        );

      case "numbered":
        return (
          <div className="flex items-start gap-3 py-1">
            <span className="mt-0.5 text-primary/60 font-medium min-w-[1.5rem]">
              {getNumberedIndex(block.id)}.
            </span>
            <div
              ref={(el) => {
                if (el) {
                  contentRefs.current.set(block.id, el);
                  if (!initializedRefs.current.has(block.id)) {
                    el.textContent = block.content || "";
                    initializedRefs.current.add(block.id);
                  }
                }
              }}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => {
                const text = e.currentTarget.textContent || "";
                if (text !== block.content) {
                  updateBlock(block.id, { content: text });
                }
              }}
              onKeyDown={(e) => handleKeyDown(e, block)}
              className="flex-1 outline-none"
              data-placeholder="List item"
            />
          </div>
        );

      case "toggle":
        return (
          <div className="py-1">
            <div className="flex items-start gap-2">
              <motion.button
                onClick={() => updateBlock(block.id, { isExpanded: !block.isExpanded })}
                className="p-1 rounded hover:bg-muted transition-colors mt-0.5"
                animate={{ rotate: block.isExpanded ? 90 : 0 }}
              >
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
              <div
                ref={(el) => {
                  if (el) {
                    contentRefs.current.set(block.id, el);
                    if (!initializedRefs.current.has(block.id)) {
                      el.textContent = block.content || "";
                      initializedRefs.current.add(block.id);
                    }
                  }
                }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const text = e.currentTarget.textContent || "";
                  if (text !== block.content) {
                    updateBlock(block.id, { content: text });
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, block)}
                className="flex-1 outline-none font-medium"
                data-placeholder="Toggle heading"
              />
            </div>
            <AnimatePresence>
              {block.isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="ml-7 mt-2 pl-4 border-l-2 border-muted"
                >
                  <div
                    ref={(el) => {
                      if (el) {
                        const toggleKey = `${block.id}-toggle`;
                        if (!initializedRefs.current.has(toggleKey)) {
                          el.textContent = block.toggleContent || "";
                          initializedRefs.current.add(toggleKey);
                        }
                      }
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const text = e.currentTarget.textContent || "";
                      if (text !== block.toggleContent) {
                        updateBlock(block.id, { toggleContent: text });
                      }
                    }}
                    className="outline-none text-sm min-h-[40px] py-1 empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
                    data-placeholder="Add content inside this toggle..."
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case "code":
        return (
          <div className="py-2 relative group/code">
            <div className={getBlockStyle("code")}>
              <div
                ref={(el) => {
                  if (el) {
                    contentRefs.current.set(block.id, el);
                    if (!initializedRefs.current.has(block.id)) {
                      el.textContent = block.content || "";
                      initializedRefs.current.add(block.id);
                    }
                  }
                }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                  const text = extractContentFromEditable(e.currentTarget);
                  if (text !== block.content) {
                    updateBlock(block.id, { content: text });
                  }
                }}
                onKeyDown={(e) => handleKeyDown(e, block)}
                className="outline-none min-h-[60px]"
                data-placeholder="// Write your code here..."
              />
            </div>
            <motion.button
              onClick={() => copyCodeToClipboard(block.id, block.content)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors opacity-0 group-hover/code:opacity-100"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copiedCode === block.id ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
            </motion.button>
          </div>
        );

      case "image":
        return (
          <div className="py-2">
            {block.imageUrl ? (
              <div className="relative group/image rounded-lg overflow-hidden">
                <img 
                  src={block.imageUrl} 
                  alt="Embedded" 
                  className="w-full max-h-[400px] object-cover rounded-lg cursor-pointer"
                  onClick={() => openLightbox([{ url: block.imageUrl! }], 0)}
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                  <div className="flex gap-2 pointer-events-auto">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openLightbox([{ url: block.imageUrl! }], 0);
                      }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <ZoomIn className="w-4 h-4 text-white" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateBlock(block.id, { imageUrl: undefined });
                      }}
                      className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                <Image className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <input
                  type="text"
                  placeholder="Paste image URL and press Enter..."
                  className="w-full max-w-md mx-auto px-4 py-2 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateBlock(block.id, { imageUrl: (e.target as HTMLInputElement).value });
                    }
                  }}
                />
              </div>
            )}
          </div>
        );

      case "bookmark":
        return (
          <div className="py-2">
            {block.bookmarkUrl ? (
              <motion.a
                href={block.bookmarkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group/bookmark"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{block.bookmarkTitle || block.bookmarkUrl}</p>
                  {block.bookmarkDescription && (
                    <p className="text-sm text-muted-foreground truncate">{block.bookmarkDescription}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 truncate mt-1">{block.bookmarkUrl}</p>
                </div>
                <ExternalLink className="w-5 h-5 text-muted-foreground opacity-0 group-hover/bookmark:opacity-100 transition-opacity" />
              </motion.a>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
                <Link2 className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <input
                  type="text"
                  placeholder="Paste URL and press Enter..."
                  className="w-full max-w-md mx-auto px-4 py-2 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const url = (e.target as HTMLInputElement).value;
                      updateBlock(block.id, { 
                        bookmarkUrl: url,
                        bookmarkTitle: new URL(url).hostname,
                      });
                    }
                  }}
                />
              </div>
            )}
          </div>
        );

      case "video":
        return (
          <div className="py-2">
            {block.videoUrl && getVideoEmbedUrl(block.videoUrl) ? (
              <div className="relative rounded-lg overflow-hidden aspect-video">
                <iframe
                  src={getVideoEmbedUrl(block.videoUrl)!}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                <Play className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <input
                  type="text"
                  placeholder="Paste YouTube or Vimeo URL..."
                  className="w-full max-w-md mx-auto px-4 py-2 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateBlock(block.id, { videoUrl: (e.target as HTMLInputElement).value });
                    }
                  }}
                />
              </div>
            )}
          </div>
        );

      case "progress":
        return (
          <div className="py-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${block.progressColor || 'bg-blue-500'} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${block.progressValue || 0}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                value={block.progressValue || 0}
                onChange={(e) => updateBlock(block.id, { progressValue: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                className="w-16 px-2 py-1 text-sm bg-muted rounded-lg outline-none text-center"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <div className="flex gap-2 mt-2">
              {progressColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateBlock(block.id, { progressColor: color.value })}
                  className={`w-5 h-5 rounded-full ${color.value} ${block.progressColor === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''}`}
                />
              ))}
            </div>
          </div>
        );

      case "equation":
        return (
          <div className="py-2">
            <div className={getBlockStyle("equation")}>
              <div
                ref={(el) => {
                  if (el) {
                    contentRefs.current.set(block.id, el);
                    if (el.textContent === "" && block.content) {
                      el.textContent = block.content;
                    }
                  }
                }}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleContentInput(block, e.currentTarget)}
                onKeyDown={(e) => handleKeyDown(e, block)}
                className="outline-none"
                data-placeholder="∑ (x² + y²) = z²"
              >
                {block.content}
              </div>
            </div>
          </div>
        );

      case "columns":
        const columnTitles = block.columnTitles || ["Column 1", "Column 2"];
        return (
          <div className="py-2">
            <div className="grid grid-cols-2 gap-4">
              {(block.columns || [[], []]).map((column, colIndex) => (
                <div key={colIndex} className="min-h-[100px] border border-dashed border-muted-foreground/20 rounded-lg p-3">
                  <input
                    type="text"
                    value={columnTitles[colIndex] || `Column ${colIndex + 1}`}
                    onChange={(e) => {
                      const newTitles = [...columnTitles];
                      newTitles[colIndex] = e.target.value;
                      updateBlock(block.id, { columnTitles: newTitles });
                    }}
                    className="text-xs text-muted-foreground mb-2 bg-transparent outline-none focus:text-foreground transition-colors w-full font-medium"
                    placeholder={`Column ${colIndex + 1}`}
                  />
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    className="outline-none text-sm min-h-[60px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/40"
                    data-placeholder="Type here..."
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case "table":
        return (
          <div className="py-2">
            <div className="border border-border rounded-lg overflow-hidden">
              {/* Column headers with delete buttons */}
              <div className="bg-muted/50 border-b border-border">
                <div className="flex">
                  {block.tableData?.[0]?.map((_, colIndex) => (
                    <div
                      key={colIndex}
                      className="flex-1 px-3 py-2 border-r border-border last:border-r-0 flex items-center justify-between gap-2"
                    >
                      <input
                        type="text"
                        value={block.tableData?.[0]?.[colIndex] || ""}
                        onChange={(e) => updateTableCell(block.id, 0, colIndex, e.target.value)}
                        className="flex-1 text-sm font-semibold outline-none bg-transparent break-words"
                        placeholder="Header"
                      />
                      {(block.tableData?.[0]?.length || 0) > 1 && (
                        <button
                          onClick={() => deleteTableColumn(block.id, colIndex)}
                          className="p-1 rounded hover:bg-destructive/10 transition-colors flex-shrink-0"
                          title="Delete column"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Data rows */}
              <div className="divide-y divide-border">
                {block.tableData?.slice(1).map((row, rowIndex) => (
                  <div key={rowIndex + 1} className="flex group/row">
                    {row.map((cell, colIndex) => (
                      <div
                        key={colIndex}
                        className="flex-1 border-r border-border last:border-r-0"
                      >
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateTableCell(block.id, rowIndex + 1, colIndex, e.target.value)}
                          className="w-full px-3 py-2 text-sm outline-none bg-transparent break-words"
                          placeholder="Cell"
                        />
                      </div>
                    ))}
                    <div className="w-8 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={() => deleteTableRow(block.id, rowIndex + 1)}
                        className="p-1 rounded hover:bg-destructive/10 transition-colors"
                        title="Delete row"
                      >
                        <X className="w-3 h-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => addTableRow(block.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <PlusCircle className="w-3 h-3" />
                Add row
              </button>
              <button
                onClick={() => addTableColumn(block.id)}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <PlusCircle className="w-3 h-3" />
                Add column
              </button>
            </div>
          </div>
        );

      case "file":
        return (
          <div className="py-2">
            {block.fileUrl ? (
              <motion.a
                href={block.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group/file"
                whileHover={{ scale: 1.01 }}
              >
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Paperclip className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{block.fileName || "Attached file"}</p>
                  <p className="text-xs text-muted-foreground truncate">{block.fileUrl}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover/file:opacity-100" />
              </motion.a>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
                <Paperclip className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <input
                  type="text"
                  placeholder="Paste file URL and press Enter..."
                  className="w-full max-w-md mx-auto px-4 py-2 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const url = (e.target as HTMLInputElement).value;
                      const fileName = url.split('/').pop() || 'File';
                      updateBlock(block.id, { fileUrl: url, fileName });
                    }
                  }}
                />
              </div>
            )}
          </div>
        );

      case "audio":
        return (
          <div className="py-2">
            {block.audioUrl ? (
              <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/20 rounded-full">
                    <Volume2 className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-sm font-medium truncate">{block.audioUrl.split('/').pop()}</span>
                </div>
                <audio controls className="w-full h-10" src={block.audioUrl}>
                  Your browser does not support audio.
                </audio>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-6 text-center">
                <Music className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <input
                  type="text"
                  placeholder="Paste audio URL (MP3, WAV, etc.)..."
                  className="w-full max-w-md mx-auto px-4 py-2 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateBlock(block.id, { audioUrl: (e.target as HTMLInputElement).value });
                    }
                  }}
                />
              </div>
            )}
          </div>
        );

      case "timeline":
        return (
          <div className="py-3">
            <div className="relative pl-6 space-y-4">
              {(block.timelineItems || []).map((item, index) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative group/timeline"
                >
                  <div className={`absolute left-0 top-2 w-3 h-3 rounded-full ${item.color} -translate-x-[1.75rem]`} />
                  {index < (block.timelineItems?.length || 0) - 1 && (
                    <div className="absolute left-0 top-5 w-0.5 h-full bg-border -translate-x-[1.5rem]" />
                  )}
                  <div className="bg-muted/30 rounded-lg p-3 border border-border hover:border-primary/30 transition-colors">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => {
                        const newItems = [...(block.timelineItems || [])];
                        newItems[index] = { ...item, title: e.target.value };
                        updateBlock(block.id, { timelineItems: newItems });
                      }}
                      className="font-medium bg-transparent outline-none w-full"
                      placeholder="Milestone title"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => {
                        const newItems = [...(block.timelineItems || [])];
                        newItems[index] = { ...item, description: e.target.value };
                        updateBlock(block.id, { timelineItems: newItems });
                      }}
                      className="text-sm text-muted-foreground bg-transparent outline-none w-full mt-1"
                      placeholder="Description"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => {
                          const newItems = [...(block.timelineItems || [])];
                          newItems[index] = { ...item, date: e.target.value };
                          updateBlock(block.id, { timelineItems: newItems });
                        }}
                        className="text-xs bg-transparent outline-none text-muted-foreground"
                      />
                      <div className="flex gap-1 ml-auto">
                        {timelineColors.map((color) => (
                          <button
                            key={color}
                            onClick={() => {
                              const newItems = [...(block.timelineItems || [])];
                              newItems[index] = { ...item, color };
                              updateBlock(block.id, { timelineItems: newItems });
                            }}
                            className={`w-3 h-3 rounded-full ${color} ${item.color === color ? 'ring-1 ring-offset-1 ring-primary' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const newItems = (block.timelineItems || []).filter((_, i) => i !== index);
                        updateBlock(block.id, { timelineItems: newItems });
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover/timeline:opacity-100 p-1 hover:bg-destructive/10 rounded transition-all"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => {
                const newItem = {
                  id: crypto.randomUUID(),
                  title: "New milestone",
                  description: "",
                  date: new Date().toISOString().split('T')[0],
                  color: timelineColors[Math.floor(Math.random() * timelineColors.length)]
                };
                updateBlock(block.id, { timelineItems: [...(block.timelineItems || []), newItem] });
              }}
              className="mt-3 flex items-center gap-2 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <PlusCircle className="w-3 h-3" />
              Add milestone
            </button>
          </div>
        );

      case "kanban":
        return (
          <div className="py-3">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {(block.kanbanColumns || []).map((column, colIndex) => (
                <div key={column.id} className="min-w-[200px] bg-muted/30 rounded-lg p-3 border border-border group/column">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={column.title}
                      onChange={(e) => {
                        const newColumns = [...(block.kanbanColumns || [])];
                        newColumns[colIndex] = { ...column, title: e.target.value };
                        updateBlock(block.id, { kanbanColumns: newColumns });
                      }}
                      className="font-medium text-sm bg-transparent outline-none flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                        {column.cards.length}
                      </span>
                      {(block.kanbanColumns || []).length > 1 && (
                        <button
                          onClick={() => {
                            const newColumns = (block.kanbanColumns || []).filter((_, i) => i !== colIndex);
                            updateBlock(block.id, { kanbanColumns: newColumns });
                          }}
                          className="opacity-0 group-hover/column:opacity-100 p-1 rounded hover:bg-destructive/10 transition-all flex-shrink-0"
                          title="Delete stage"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {column.cards.map((card, cardIndex) => (
                      <motion.div
                        key={card.id}
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-background p-2.5 rounded-lg border border-border shadow-sm group/card"
                      >
                        <div className="flex items-start gap-2">
                          <input
                            type="text"
                            value={card.content}
                            onChange={(e) => {
                              const newColumns = [...(block.kanbanColumns || [])];
                              newColumns[colIndex].cards[cardIndex] = { ...card, content: e.target.value };
                              updateBlock(block.id, { kanbanColumns: newColumns });
                            }}
                            className="flex-1 text-sm bg-transparent outline-none"
                            placeholder="Task..."
                          />
                          <button
                            onClick={() => {
                              const newColumns = [...(block.kanbanColumns || [])];
                              newColumns[colIndex].cards = column.cards.filter((_, i) => i !== cardIndex);
                              updateBlock(block.id, { kanbanColumns: newColumns });
                            }}
                            className="opacity-0 group-hover/card:opacity-100 p-0.5 hover:bg-destructive/10 rounded transition-all"
                          >
                            <X className="w-3 h-3 text-destructive" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                    <button
                      onClick={() => {
                        const newColumns = [...(block.kanbanColumns || [])];
                        newColumns[colIndex].cards.push({ id: crypto.randomUUID(), content: "" });
                        updateBlock(block.id, { kanbanColumns: newColumns });
                      }}
                      className="w-full py-2 text-xs text-muted-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      + Add card
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={() => {
                  const newColumn = { id: crypto.randomUUID(), title: "New Column", cards: [] };
                  updateBlock(block.id, { kanbanColumns: [...(block.kanbanColumns || []), newColumn] });
                }}
                className="min-w-[150px] h-fit p-3 border-2 border-dashed border-muted-foreground/20 rounded-lg text-xs text-muted-foreground hover:border-primary/30 transition-colors"
              >
                + Add column
              </button>
            </div>
          </div>
        );

      case "rating":
        return (
          <div className="py-3">
            <div className="flex items-center gap-1">
              {Array.from({ length: block.ratingMax || 5 }).map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => updateBlock(block.id, { ratingValue: index + 1 })}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-1"
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      index < (block.ratingValue || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </motion.button>
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {block.ratingValue || 0} / {block.ratingMax || 5}
              </span>
              <div className="ml-auto flex gap-1">
                {[3, 5, 10].map((max) => (
                  <button
                    key={max}
                    onClick={() => updateBlock(block.id, { ratingMax: max, ratingValue: Math.min(block.ratingValue || 0, max) })}
                    className={`text-xs px-2 py-1 rounded ${block.ratingMax === max ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    {max}★
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case "countdown":
        const CountdownDisplay = () => {
          const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
          
          useEffect(() => {
            const calculateTimeLeft = () => {
              const target = new Date(block.countdownDate || Date.now()).getTime();
              const now = Date.now();
              const diff = target - now;
              
              if (diff > 0) {
                setTimeLeft({
                  days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                  hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                  minutes: Math.floor((diff / 1000 / 60) % 60),
                  seconds: Math.floor((diff / 1000) % 60),
                });
              } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
              }
            };
            
            calculateTimeLeft();
            const interval = setInterval(calculateTimeLeft, 1000);
            return () => clearInterval(interval);
          }, [block.countdownDate]);
          
          return (
            <div className="flex gap-3 justify-center">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Minutes", value: timeLeft.minutes },
                { label: "Seconds", value: timeLeft.seconds },
              ].map((unit) => (
                <div key={unit.label} className="text-center">
                  <motion.div 
                    className="bg-primary/10 text-primary text-2xl font-bold px-4 py-3 rounded-lg min-w-[60px]"
                    key={unit.value}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                  >
                    {unit.value.toString().padStart(2, '0')}
                  </motion.div>
                  <p className="text-xs text-muted-foreground mt-1">{unit.label}</p>
                </div>
              ))}
            </div>
          );
        };
        
        return (
          <div className="py-4">
            <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    value={block.countdownTitle || "Countdown"}
                    onChange={(e) => updateBlock(block.id, { countdownTitle: e.target.value })}
                    className="font-medium bg-transparent outline-none"
                  />
                </div>
                <input
                  type="date"
                  value={block.countdownDate || ""}
                  onChange={(e) => updateBlock(block.id, { countdownDate: e.target.value })}
                  className="text-sm bg-muted/50 px-3 py-1 rounded-lg outline-none"
                />
              </div>
              <CountdownDisplay />
            </div>
          </div>
        );

      case "embed":
        return (
          <div className="py-2">
            {block.embedUrl ? (
              <div className="rounded-lg overflow-hidden border border-border">
                <iframe
                  src={block.embedUrl}
                  className="w-full h-[400px]"
                  sandbox="allow-scripts allow-same-origin"
                />
                <div className="flex items-center justify-between p-2 bg-muted/30 text-xs">
                  <span className="truncate text-muted-foreground">{block.embedUrl}</span>
                  <button
                    onClick={() => updateBlock(block.id, { embedUrl: undefined })}
                    className="text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                <Globe className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground mb-3">Embed external content</p>
                <input
                  type="text"
                  placeholder="Paste embed URL (Figma, CodePen, etc.)..."
                  className="w-full max-w-md mx-auto px-4 py-2 bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      updateBlock(block.id, { embedUrl: (e.target as HTMLInputElement).value });
                    }
                  }}
                />
              </div>
            )}
          </div>
        );

      case "database":
        return (
          <div className="py-3">
            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    {(block.databaseColumns || []).map((col) => (
                      <th key={col.id} className="px-3 py-2 text-left text-sm font-medium border-r border-border last:border-r-0">
                        <div className="flex items-center gap-2">
                          {col.type === "checkbox" ? <CheckSquare className="w-3 h-3" /> :
                           col.type === "date" ? <Calendar className="w-3 h-3" /> :
                           col.type === "number" ? <span className="text-xs">#</span> :
                           <Type className="w-3 h-3" />}
                          <span>{col.name}</span>
                        </div>
                      </th>
                    ))}
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody>
                  {(block.databaseRows || []).map((row, rowIndex) => (
                    <tr key={row.id} className="border-t border-border group/dbrow">
                      {(block.databaseColumns || []).map((col) => (
                        <td key={col.id} className="px-3 py-2 border-r border-border last:border-r-0">
                          {col.type === "checkbox" ? (
                            <input
                              type="checkbox"
                              checked={row.cells[col.id] === "true"}
                              onChange={(e) => {
                                const newRows = [...(block.databaseRows || [])];
                                newRows[rowIndex].cells[col.id] = e.target.checked.toString();
                                updateBlock(block.id, { databaseRows: newRows });
                              }}
                              className="w-4 h-4"
                            />
                          ) : col.type === "date" ? (
                            <input
                              type="date"
                              value={row.cells[col.id] || ""}
                              onChange={(e) => {
                                const newRows = [...(block.databaseRows || [])];
                                newRows[rowIndex].cells[col.id] = e.target.value;
                                updateBlock(block.id, { databaseRows: newRows });
                              }}
                              className="text-sm bg-transparent outline-none"
                            />
                          ) : (
                            <input
                              type={col.type === "number" ? "number" : "text"}
                              value={row.cells[col.id] || ""}
                              onChange={(e) => {
                                const newRows = [...(block.databaseRows || [])];
                                newRows[rowIndex].cells[col.id] = e.target.value;
                                updateBlock(block.id, { databaseRows: newRows });
                              }}
                              className="w-full text-sm bg-transparent outline-none"
                              placeholder="..."
                            />
                          )}
                        </td>
                      ))}
                      <td className="opacity-0 group-hover/dbrow:opacity-100">
                        <button
                          onClick={() => {
                            const newRows = (block.databaseRows || []).filter((_, i) => i !== rowIndex);
                            updateBlock(block.id, { databaseRows: newRows });
                          }}
                          className="p-1 hover:bg-destructive/10 rounded"
                        >
                          <X className="w-3 h-3 text-destructive" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => {
                  const newRow = {
                    id: crypto.randomUUID(),
                    cells: (block.databaseColumns || []).reduce((acc, col) => ({ ...acc, [col.id]: "" }), {})
                  };
                  updateBlock(block.id, { databaseRows: [...(block.databaseRows || []), newRow] });
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                <PlusCircle className="w-3 h-3" />
                Add row
              </button>
            </div>
          </div>
        );

      case "mindmap":
        return (
          <div className="py-2">
            <MindMap
              nodes={block.mindMapNodes || []}
              connections={block.mindMapConnections || []}
              onChange={(nodes, connections) => updateBlock(block.id, { mindMapNodes: nodes, mindMapConnections: connections })}
              title={block.content || "Mind Map"}
              onTitleChange={(title) => updateBlock(block.id, { content: title })}
            />
          </div>
        );

      case "gallery":
        const galleryImages = block.galleryImages || [];
        return (
          <div className="py-3">
            <div className="grid grid-cols-3 gap-2">
              {galleryImages.map((img, index) => (
                <div key={img.id} className="relative group/img aspect-square">
                  <img
                    src={img.url}
                    alt={img.caption || "Gallery image"}
                    className="w-full h-full object-cover rounded-lg cursor-pointer"
                    onClick={() => openLightbox(galleryImages, index)}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center rounded-lg gap-2 pointer-events-none">
                    <div className="flex gap-2 pointer-events-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openLightbox(galleryImages, index);
                        }}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                      >
                        <ZoomIn className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newImages = galleryImages.filter((_, i) => i !== index);
                          updateBlock(block.id, { galleryImages: newImages });
                        }}
                        className="p-2 bg-white/10 rounded-lg hover:bg-white/20"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="aspect-square border-2 border-dashed border-muted-foreground/20 rounded-lg flex items-center justify-center hover:border-primary/30 transition-colors">
                <input
                  type="text"
                  placeholder="Paste URL"
                  className="w-full h-full text-center text-xs bg-transparent outline-none p-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const url = (e.target as HTMLInputElement).value;
                      if (url) {
                        const newImage = { id: crypto.randomUUID(), url };
                        updateBlock(block.id, { galleryImages: [...galleryImages, newImage] });
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        );

      case "flashcard":
        return (
          <div className="py-2">
            <FlashcardBlock
              flashcards={block.flashcards || []}
              title={block.content || "Flashcards"}
              onChange={(flashcards) => updateBlock(block.id, { flashcards })}
              onTitleChange={(title) => updateBlock(block.id, { content: title })}
              onOpenStudyMode={() => setStudyModeBlock(block)}
            />
          </div>
        );

      case "chart":
        return (
          <div className="py-2">
            <ChartBlock
              chartType={block.chartType || "bar"}
              chartTitle={block.chartTitle || "My Chart"}
              chartColumns={block.chartColumns}
              chartRows={block.chartRows}
              chartXAxisKey={block.chartXAxisKey}
              chartSelectedSeries={block.chartSelectedSeries}
              chartSeriesColors={block.chartSeriesColors}
              chartData={block.chartData}
              onUpdate={(updates) => updateBlock(block.id, updates)}
            />
          </div>
        );

      default:
        return renderEditableContent(block);
    }
  };

  return (
    <>
      <div className="space-y-1 min-h-[200px]">
        {blocks.map((block) => (
          <motion.div
            key={block.id}
            layout
            ref={(el) => el && blockRefs.current.set(block.id, el)}
            initial={{ opacity: 0, y: -5 }}
            animate={{
              opacity: draggedBlockId === block.id ? 0.5 : 1,
              y: 0,
              scale: draggedBlockId === block.id ? 0.98 : 1,
            }}
            transition={{ duration: 0.15, type: "spring", stiffness: 300, damping: 30 }}
            className={`group relative flex items-start gap-1 rounded-lg transition-all ${
              draggedBlockId === block.id
                ? 'bg-primary/5 shadow-lg shadow-primary/20'
                : ''
            } ${
              dragOverBlockId === block.id && draggedBlockId !== block.id
                ? 'border-t-2 border-primary/50 pt-1'
                : ''
            }`}
            onMouseEnter={() => {
              setActiveBlockId(block.id);
              if (draggedBlockId && draggedBlockId !== block.id) {
                setDragOverBlockId(block.id);
              }
            }}
            onMouseLeave={() => {
              if (draggedBlockId !== block.id) {
                setActiveBlockId(null);
                if (dragOverBlockId === block.id) {
                  setDragOverBlockId(null);
                }
              }
            }}
          >
            {/* Block Controls */}
            <motion.div 
              className={`flex items-center gap-0.5 pt-1 transition-all duration-200 ${
                activeBlockId === block.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              <motion.button
                onClick={() => setShowMenu(showMenu === block.id ? null : block.id)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors group/btn"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Plus className="w-4 h-4 text-muted-foreground group-hover/btn:text-primary transition-colors" />
              </motion.button>
              <motion.button
                className="p-1.5 rounded-lg hover:bg-muted transition-colors cursor-grab active:cursor-grabbing"
                whileHover={{ scale: 1.1 }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  handleBlockDragStart(block.id, e.clientY);
                }}
              >
                <GripVertical className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            </motion.div>

            {/* Block Content */}
            <div className="flex-1 relative">
              {renderBlock(block)}

              {/* Block Type Menu */}
              <AnimatePresence>
                {showMenu === block.id && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 top-full mt-2 z-50 bg-card border border-border rounded-xl shadow-2xl overflow-hidden min-w-[280px]"
                  >
                    {/* Search Input */}
                    <div className="p-2 border-b border-border">
                      <input
                        type="text"
                        value={menuFilter}
                        onChange={(e) => setMenuFilter(e.target.value)}
                        placeholder="Filter blocks..."
                        className="w-full px-3 py-2 text-sm bg-muted/50 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        autoFocus
                      />
                    </div>
                    
                    <div className="p-1.5 max-h-[350px] overflow-y-auto scrollbar-thin">
                      {/* Basic Blocks */}
                      {filteredBlockTypes.filter(bt => bt.category === "basic").length > 0 && (
                        <>
                          <p className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                            Basic
                          </p>
                          {filteredBlockTypes.filter(bt => bt.category === "basic").map((bt) => (
                            <motion.button
                              key={bt.type}
                              onClick={() => {
                                updateBlock(block.id, { type: bt.type, content: bt.type === "divider" ? "---" : block.content });
                                setShowMenu(null);
                                setMenuFilter("");
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-all text-left group/item"
                              whileHover={{ x: 4 }}
                            >
                              <div className="p-2 rounded-lg bg-muted group-hover/item:bg-primary/10 transition-colors">
                                <bt.icon className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                              </div>
                              <div>
                                <span className="text-sm font-medium block">{bt.label}</span>
                                <span className="text-xs text-muted-foreground">{bt.description}</span>
                              </div>
                            </motion.button>
                          ))}
                        </>
                      )}

                      {/* Lists */}
                      {filteredBlockTypes.filter(bt => bt.category === "lists").length > 0 && (
                        <>
                          <p className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-2">
                            Lists
                          </p>
                          {filteredBlockTypes.filter(bt => bt.category === "lists").map((bt) => (
                            <motion.button
                              key={bt.type}
                              onClick={() => {
                                updateBlock(block.id, { 
                                  type: bt.type, 
                                  content: block.content,
                                  isExpanded: bt.type === "toggle" ? true : undefined,
                                  toggleContent: bt.type === "toggle" ? "" : undefined,
                                });
                                setShowMenu(null);
                                setMenuFilter("");
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-all text-left group/item"
                              whileHover={{ x: 4 }}
                            >
                              <div className="p-2 rounded-lg bg-muted group-hover/item:bg-primary/10 transition-colors">
                                <bt.icon className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                              </div>
                              <div>
                                <span className="text-sm font-medium block">{bt.label}</span>
                                <span className="text-xs text-muted-foreground">{bt.description}</span>
                              </div>
                            </motion.button>
                          ))}
                        </>
                      )}

                      {/* Media & Embeds */}
                      {filteredBlockTypes.filter(bt => bt.category === "media").length > 0 && (
                        <>
                          <p className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-2">
                            Media & Embeds
                          </p>
                          {filteredBlockTypes.filter(bt => bt.category === "media").map((bt) => (
                            <motion.button
                              key={bt.type}
                              onClick={() => {
                                const baseUpdate: Partial<NoteBlock> = { type: bt.type, content: "" };
                                if (bt.type === "gallery") {
                                  baseUpdate.galleryImages = [];
                                }
                                updateBlock(block.id, baseUpdate);
                                setShowMenu(null);
                                setMenuFilter("");
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-all text-left group/item"
                              whileHover={{ x: 4 }}
                            >
                              <div className="p-2 rounded-lg bg-muted group-hover/item:bg-primary/10 transition-colors">
                                <bt.icon className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                              </div>
                              <div>
                                <span className="text-sm font-medium block">{bt.label}</span>
                                <span className="text-xs text-muted-foreground">{bt.description}</span>
                              </div>
                            </motion.button>
                          ))}
                        </>
                      )}

                      {/* Advanced */}
                      {filteredBlockTypes.filter(bt => bt.category === "advanced").length > 0 && (
                        <>
                          <p className="px-3 py-2 text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-2">
                            Advanced
                          </p>
                          {filteredBlockTypes.filter(bt => bt.category === "advanced").map((bt) => (
                            <motion.button
                              key={bt.type}
                              onClick={() => {
                                const baseUpdate: Partial<NoteBlock> = { type: bt.type, content: "" };
                                
                                // Set default values for each advanced block type
                                if (bt.type === "table") {
                                  baseUpdate.tableData = [["", "", ""], ["", "", ""], ["", "", ""]];
                                } else if (bt.type === "progress") {
                                  baseUpdate.progressValue = 50;
                                  baseUpdate.progressColor = "bg-blue-500";
                                } else if (bt.type === "columns") {
                                  baseUpdate.columns = [[{ id: crypto.randomUUID(), type: "text", content: "" }], [{ id: crypto.randomUUID(), type: "text", content: "" }]];
                                  baseUpdate.columnTitles = ["Column 1", "Column 2"];
                                } else if (bt.type === "timeline") {
                                  baseUpdate.timelineItems = [{ id: crypto.randomUUID(), title: "Milestone 1", description: "Description", date: new Date().toISOString().split('T')[0], color: "bg-blue-500" }];
                                } else if (bt.type === "kanban") {
                                  baseUpdate.kanbanColumns = [
                                    { id: crypto.randomUUID(), title: "To Do", cards: [{ id: crypto.randomUUID(), content: "New task" }] },
                                    { id: crypto.randomUUID(), title: "In Progress", cards: [] },
                                    { id: crypto.randomUUID(), title: "Done", cards: [] }
                                  ];
                                } else if (bt.type === "rating") {
                                  baseUpdate.ratingValue = 3;
                                  baseUpdate.ratingMax = 5;
                                } else if (bt.type === "countdown") {
                                  baseUpdate.countdownDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                                  baseUpdate.countdownTitle = "Countdown";
                                } else if (bt.type === "database") {
                                  baseUpdate.databaseRows = [{ id: crypto.randomUUID(), cells: { name: "", status: "", date: "" } }];
                                  baseUpdate.databaseColumns = [
                                    { id: "name", name: "Name", type: "text" },
                                    { id: "status", name: "Status", type: "select" },
                                    { id: "date", name: "Date", type: "date" }
                                  ];
                                } else if (bt.type === "mindmap") {
                                  baseUpdate.mindMapNodes = [{ id: crypto.randomUUID(), text: "Central Idea", x: 150, y: 150, color: "bg-blue-500" }];
                                  baseUpdate.mindMapConnections = [];
                                } else if (bt.type === "flashcard") {
                                  baseUpdate.flashcards = [];
                                  baseUpdate.content = "Flashcards";
                                }
                                
                                updateBlock(block.id, baseUpdate);
                                setShowMenu(null);
                                setMenuFilter("");
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-all text-left group/item"
                              whileHover={{ x: 4 }}
                            >
                              <div className="p-2 rounded-lg bg-muted group-hover/item:bg-primary/10 transition-colors">
                                <bt.icon className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors" />
                              </div>
                              <div>
                                <span className="text-sm font-medium block">{bt.label}</span>
                                <span className="text-xs text-muted-foreground">{bt.description}</span>
                              </div>
                            </motion.button>
                          ))}
                        </>
                      )}
                      
                      {filteredBlockTypes.length === 0 && (
                        <p className="px-3 py-4 text-sm text-muted-foreground text-center">
                          No blocks found
                        </p>
                      )}
                      
                      <div className="border-t border-border my-1.5" />
                      <motion.button
                        onClick={() => deleteBlock(block.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-all text-left group/delete"
                        whileHover={{ x: 4 }}
                      >
                        <div className="p-2 rounded-lg bg-destructive/10">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </div>
                        <div>
                          <span className="text-sm font-medium text-destructive block">Delete</span>
                          <span className="text-xs text-destructive/60">Remove this block</span>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}

        {/* Click to add block at end */}
        <motion.div
          onClick={() => addBlockAfter(blocks[blocks.length - 1]?.id || "")}
          className="h-24 cursor-text flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.01 }}
        >
          <span className="text-sm text-muted-foreground/50">Click to add a block</span>
        </motion.div>
      </div>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        currentIndex={lightboxIndex}
        onNavigate={setLightboxIndex}
      />

      {/* Flashcard Study Mode */}
      <AnimatePresence>
        {studyModeBlock && (
          <FlashcardStudyMode
            flashcards={studyModeBlock.flashcards || []}
            title={studyModeBlock.content || "Flashcards"}
            onClose={() => setStudyModeBlock(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default NotionEditor;
