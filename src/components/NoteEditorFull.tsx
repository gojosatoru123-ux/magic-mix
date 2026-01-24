import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, MoreHorizontal, Star, Share2, Clock } from "lucide-react";
import NotionEditor from "./NotionEditor";
import FloatingToolbar from "./FloatingToolbar";
import { Note, NoteBlock } from "@/contexts/NotesContext";
import { format } from "date-fns";

interface NoteEditorFullProps {
  note: Note;
  onUpdate: (updates: Partial<Note>) => void;
}

const tagColors = [
  { name: "green", bg: "bg-emerald-500/10", text: "text-emerald-600", border: "border-emerald-500/20" },
  { name: "blue", bg: "bg-blue-500/10", text: "text-blue-600", border: "border-blue-500/20" },
  { name: "purple", bg: "bg-purple-500/10", text: "text-purple-600", border: "border-purple-500/20" },
  { name: "orange", bg: "bg-orange-500/10", text: "text-orange-600", border: "border-orange-500/20" },
  { name: "pink", bg: "bg-pink-500/10", text: "text-pink-600", border: "border-pink-500/20" },
  { name: "gray", bg: "bg-muted", text: "text-muted-foreground", border: "border-border" },
];

const NoteEditorFull = ({ note, onUpdate }: NoteEditorFullProps) => {
  const [newTagInput, setNewTagInput] = useState("");
  const [showTagInput, setShowTagInput] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddTag = () => {
    if (newTagInput.trim()) {
      const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
      const newTag = {
        id: crypto.randomUUID(),
        label: newTagInput.trim(),
        color: randomColor.name,
      };
      onUpdate({ tags: [...note.tags, newTag] });
      setNewTagInput("");
      setShowTagInput(false);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onUpdate({ tags: note.tags.filter((t) => t.id !== tagId) });
  };

  const handleBlocksChange = (blocks: NoteBlock[]) => {
    onUpdate({ blocks });
  };

  const getTagStyle = (colorName: string) => {
    const color = tagColors.find((c) => c.name === colorName) || tagColors[5];
    return `${color.bg} ${color.text} ${color.border}`;
  };

  return (
    <div className="flex-1 h-full bg-card flex flex-col overflow-hidden">
      {/* Floating Toolbar - appears on text selection */}
      <FloatingToolbar />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Updated {format(new Date(note.updatedAt), "MMM d, h:mm a")}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2 rounded-lg transition-colors ${isFavorite ? 'text-yellow-500' : 'hover:bg-muted text-muted-foreground'}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </motion.button>
          <motion.button
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
          <motion.button
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto p-6 md:p-10">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <input
              type="text"
              value={note.title}
              onChange={(e) => onUpdate({ title: e.target.value })}
              className="w-full text-4xl md:text-5xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/30 tracking-tight"
              placeholder="Untitled"
            />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-2 mb-8 flex-wrap"
          >
            {note.tags.map((tag, index) => (
              <motion.span
                key={tag.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:shadow-sm ${getTagStyle(tag.color)}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                {tag.label}
                <button
                  onClick={() => handleRemoveTag(tag.id)}
                  className="ml-0.5 hover:text-destructive transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
            
            {showTagInput ? (
              <motion.input
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTag();
                  if (e.key === "Escape") setShowTagInput(false);
                }}
                onBlur={() => {
                  if (newTagInput) handleAddTag();
                  else setShowTagInput(false);
                }}
                autoFocus
                className="px-3 py-1.5 text-xs border-2 border-primary rounded-full outline-none bg-transparent min-w-[80px] focus:ring-2 focus:ring-primary/20"
                placeholder="Tag name"
              />
            ) : (
              <motion.button
                onClick={() => setShowTagInput(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border border-dashed border-muted-foreground/30 text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-3 h-3" />
                Add tag
              </motion.button>
            )}
          </motion.div>

          {/* Notion-like Editor */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <NotionEditor blocks={note.blocks} onChange={handleBlocksChange} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NoteEditorFull;
