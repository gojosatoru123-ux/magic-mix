import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  X,
  Bold,
  Italic,
  Palette,
  Link2,
  BarChart3,
  Copy,
} from "lucide-react";
import { NoteBlock } from "@/contexts/NotesContext";

interface CellFormatting {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bgColor?: string;
}

interface CellData {
  value: string;
  formatting?: CellFormatting;
}

interface DataTableProps {
  block: NoteBlock;
  onUpdate: (updates: Partial<NoteBlock>) => void;
  onCreateChart?: (tableId: string, columns: string[]) => void;
}

const colorOptions = [
  { name: "Default", value: "" },
  { name: "Red", value: "#ef4444" },
  { name: "Green", value: "#22c55e" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Yellow", value: "#eab308" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
];

const DataTable = ({ block, onUpdate, onCreateChart }: DataTableProps) => {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [showFormatting, setShowFormatting] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<{ top: number; left: number } | null>(null);

  // Compatibility: convert old tableData to new cellData format if needed
  const tableData = block.tableData || [["Name", "Value"], ["", ""]];
  const cellFormattingMap = (block.cellFormattingMap as Record<string, CellFormatting>) || {};

  const getCellKey = (row: number, col: number) => `${row}-${col}`;
  const getCellFormatting = (row: number, col: number) => cellFormattingMap[getCellKey(row, col)];

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newTableData = tableData.map((row, rIdx) =>
      row.map((cell, cIdx) => (rIdx === rowIndex && cIdx === colIndex ? value : cell))
    );
    onUpdate({ tableData: newTableData });
  };

  const updateCellFormatting = (rowIndex: number, colIndex: number, formatting: Partial<CellFormatting>) => {
    const key = getCellKey(rowIndex, colIndex);
    const newMap = {
      ...cellFormattingMap,
      [key]: { ...getCellFormatting(rowIndex, colIndex), ...formatting },
    };
    onUpdate({ cellFormattingMap: newMap });
  };

  const addRow = () => {
    const newRow = Array(tableData[0]?.length || 3).fill("");
    onUpdate({ tableData: [...tableData, newRow] });
  };

  const addColumn = () => {
    const newTableData = tableData.map((row) => [...row, ""]);
    onUpdate({ tableData: newTableData });
  };

  const deleteRow = (rowIndex: number) => {
    if (tableData.length <= 2) return; // Keep at least header and one row
    const newTableData = tableData.filter((_, idx) => idx !== rowIndex);
    onUpdate({ tableData: newTableData });
  };

  const deleteColumn = (colIndex: number) => {
    if (tableData[0]?.length <= 1) return; // Keep at least one column
    const newTableData = tableData.map((row) => row.filter((_, idx) => idx !== colIndex));
    onUpdate({ tableData: newTableData });
  };

  const getCellStyle = (formatting?: CellFormatting) => ({
    fontWeight: formatting?.bold ? "600" : "400",
    fontStyle: formatting?.italic ? "italic" : "normal",
    color: formatting?.color || "inherit",
    backgroundColor: formatting?.bgColor || "transparent",
  });

  const getChartColumns = () => {
    const headers = tableData[0] || [];
    return headers.filter((_, idx) => idx > 0); // Skip first column (usually labels)
  };

  return (
    <div className="py-3 space-y-3">
      {/* Table Container with Horizontal Scroll */}
      <div className="border border-border rounded-lg overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-primary/10 to-primary/5">
              {tableData[0]?.map((header, colIndex) => (
                <th
                  key={colIndex}
                  className="px-3 py-3 text-left text-sm font-bold border-r border-border last:border-r-0 group/col hover:bg-primary/10 transition-colors relative min-w-[150px]"
                >
                  <input
                    type="text"
                    value={header}
                    onChange={(e) => updateCell(0, colIndex, e.target.value)}
                    style={getCellStyle(getCellFormatting(0, colIndex))}
                    className="w-full bg-transparent outline-none font-semibold"
                    placeholder="Column..."
                  />
                  {tableData[0].length > 1 && (
                    <button
                      onClick={() => deleteColumn(colIndex)}
                      className="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/col:opacity-100 p-1 bg-background rounded-full border border-border hover:bg-destructive/10 transition-all"
                    >
                      <X className="w-3 h-3 text-destructive" />
                    </button>
                  )}
                </th>
              ))}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {tableData.slice(1).map((row, rowIndex) => (
              <tr
                key={rowIndex + 1}
                className="border-t border-border hover:bg-muted/30 transition-colors group/row"
              >
                {row.map((cell, colIndex) => {
                  const formatting = getCellFormatting(rowIndex + 1, colIndex);
                  const isSelected = selectedCell?.row === rowIndex + 1 && selectedCell?.col === colIndex;

                  return (
                    <td
                      key={colIndex}
                      className={`px-3 py-2 border-r border-border last:border-r-0 relative min-w-[150px] ${
                        isSelected ? "bg-primary/10 ring-2 ring-primary" : ""
                      }`}
                      onClick={(e) => {
                        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                        setToolbarPosition({
                          top: rect.top - 60,
                          left: rect.left,
                        });
                        setSelectedCell({ row: rowIndex + 1, col: colIndex });
                      }}
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(rowIndex + 1, colIndex, e.target.value)}
                        style={getCellStyle(formatting)}
                        className="w-full bg-transparent outline-none text-sm py-1 px-1 rounded"
                        placeholder="..."
                      />
                    </td>
                  );
                })}
                <td className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteRow(rowIndex + 1)}
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

      {/* Floating Cell Formatting Toolbar */}
      <AnimatePresence>
        {selectedCell && toolbarPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              top: `${toolbarPosition.top}px`,
              left: `${toolbarPosition.left}px`,
              zIndex: 50,
              transform: "translateX(-50%)",
            }}
            className="bg-foreground text-background rounded-lg shadow-2xl py-1.5 px-1 flex items-center gap-0.5 backdrop-blur-sm border border-foreground/20"
          >
            {/* Bold Button */}
            <button
              onClick={() =>
                updateCellFormatting(
                  selectedCell.row,
                  selectedCell.col,
                  { bold: !getCellFormatting(selectedCell.row, selectedCell.col)?.bold }
                )
              }
              title="Bold (Cmd+B)"
              className={`flex items-center justify-center p-1.5 rounded transition-all ${
                getCellFormatting(selectedCell.row, selectedCell.col)?.bold
                  ? "bg-background text-foreground"
                  : "hover:bg-white/20"
              }`}
            >
              <Bold className="w-4 h-4" />
            </button>

            {/* Italic Button */}
            <button
              onClick={() =>
                updateCellFormatting(
                  selectedCell.row,
                  selectedCell.col,
                  { italic: !getCellFormatting(selectedCell.row, selectedCell.col)?.italic }
                )
              }
              title="Italic (Cmd+I)"
              className={`flex items-center justify-center p-1.5 rounded transition-all ${
                getCellFormatting(selectedCell.row, selectedCell.col)?.italic
                  ? "bg-background text-foreground"
                  : "hover:bg-white/20"
              }`}
            >
              <Italic className="w-4 h-4" />
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-white/20 mx-0.5" />

            {/* Text Color */}
            <div className="relative group">
              <button
                title="Text color"
                className="flex items-center justify-center p-1.5 rounded hover:bg-white/20 transition-all"
              >
                <Palette className="w-4 h-4" />
              </button>
              <div className="absolute hidden group-hover:flex flex-col gap-1 bg-background border border-border rounded-lg shadow-lg p-1.5 z-50 top-full mt-1.5 left-1/2 -translate-x-1/2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() =>
                      updateCellFormatting(selectedCell.row, selectedCell.col, { color: color.value || undefined })
                    }
                    className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted rounded whitespace-nowrap transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: color.value || "#999" }}
                    />
                    {color.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            <div className="relative group">
              <button
                title="Highlight color"
                className="flex items-center justify-center p-1.5 rounded hover:bg-white/20 transition-all"
              >
                <div className="w-4 h-4 bg-current opacity-70" />
              </button>
              <div className="absolute hidden group-hover:flex flex-col gap-1 bg-background border border-border rounded-lg shadow-lg p-1.5 z-50 top-full mt-1.5 left-1/2 -translate-x-1/2">
                {colorOptions.map((color) => (
                  <button
                    key={`bg-${color.value}`}
                    onClick={() =>
                      updateCellFormatting(selectedCell.row, selectedCell.col, { bgColor: color.value || undefined })
                    }
                    className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-muted rounded whitespace-nowrap transition-colors"
                  >
                    <div
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: color.value || "#999" }}
                    />
                    Highlight
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={addRow}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add row
        </button>
        <button
          onClick={addColumn}
          className="flex items-center gap-1 px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add column
        </button>
        {tableData.length > 1 && getChartColumns().length > 0 && (
          <button
            onClick={() => {
              if (onCreateChart) {
                onCreateChart(block.id, getChartColumns());
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors ml-auto"
          >
            <BarChart3 className="w-3 h-3" />
            Link to chart
          </button>
        )}
      </div>
    </div>
  );
};

export default DataTable;
