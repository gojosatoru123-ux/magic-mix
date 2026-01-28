import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
} from "lucide-react";

interface ChartDataItem {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface ChartBlockProps {
  chartType: "bar" | "line" | "pie" | "area" | "donut";
  chartTitle: string;
  chartData: ChartDataItem[];
  onUpdate: (updates: {
    chartType?: "bar" | "line" | "pie" | "area" | "donut";
    chartTitle?: string;
    chartData?: ChartDataItem[];
  }) => void;
}

const chartColors = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#a855f7", // purple
  "#f97316", // orange
  "#ec4899", // pink
  "#14b8a6", // teal
  "#eab308", // yellow
  "#ef4444", // red
];

const ChartBlock = ({ chartType, chartTitle, chartData, onUpdate }: ChartBlockProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(chartTitle);
  const [editingData, setEditingData] = useState<ChartDataItem[]>(chartData);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const chartTypes: { type: "bar" | "line" | "pie" | "area" | "donut"; icon: any; label: string }[] = [
    { type: "bar", icon: BarChart3, label: "Bar" },
    { type: "line", icon: LineChartIcon, label: "Line" },
    { type: "pie", icon: PieChartIcon, label: "Pie" },
    { type: "area", icon: AreaChartIcon, label: "Area" },
    { type: "donut", icon: PieChartIcon, label: "Donut" },
  ];

  const handleAddDataPoint = () => {
    const newItem: ChartDataItem = {
      id: crypto.randomUUID(),
      label: `Item ${editingData.length + 1}`,
      value: Math.floor(Math.random() * 100) + 10,
      color: chartColors[editingData.length % chartColors.length],
    };
    setEditingData([...editingData, newItem]);
  };

  const handleUpdateDataPoint = (id: string, field: "label" | "value" | "color", value: string | number) => {
    setEditingData(
      editingData.map((item) =>
        item.id === id ? { ...item, [field]: field === "value" ? Number(value) : value } : item
      )
    );
  };

  const handleDeleteDataPoint = (id: string) => {
    if (editingData.length > 1) {
      setEditingData(editingData.filter((item) => item.id !== id));
    }
  };

  const handleSave = () => {
    onUpdate({
      chartTitle: editingTitle,
      chartData: editingData,
    });
    setIsEditing(false);
    setEditingItemId(null);
  };

  const handleCancel = () => {
    setEditingTitle(chartTitle);
    setEditingData(chartData);
    setIsEditing(false);
    setEditingItemId(null);
  };

  const renderChart = () => {
    const data = chartData.map((item) => ({
      name: item.label,
      value: item.value,
      fill: item.color,
    }));

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartData[0]?.color || "#3b82f6"}
                strokeWidth={2}
                dot={{ fill: chartData[0]?.color || "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={chartData[0]?.color || "#3b82f6"}
                fill={chartData[0]?.color || "#3b82f6"}
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={chartType === "donut" ? 60 : 0}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        {isEditing ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            className="text-lg font-semibold bg-muted px-3 py-1.5 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Chart Title"
          />
        ) : (
          <h3 className="text-lg font-semibold text-foreground">{chartTitle}</h3>
        )}

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <motion.button
                onClick={handleSave}
                className="p-2 rounded-lg bg-primary text-primary-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Check className="w-4 h-4" />
              </motion.button>
              <motion.button
                onClick={handleCancel}
                className="p-2 rounded-lg bg-muted hover:bg-muted/80"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-4 h-4" />
              </motion.button>
            </>
          ) : (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit3 className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Chart Type Selector */}
      {isEditing && (
        <div className="flex items-center gap-2 flex-wrap">
          {chartTypes.map((ct) => (
            <motion.button
              key={ct.type}
              onClick={() => onUpdate({ chartType: ct.type })}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                chartType === ct.type
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted border-border hover:border-primary/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ct.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{ct.label}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Chart Display */}
      <div className="bg-muted/30 rounded-lg p-2">{renderChart()}</div>

      {/* Data Editor */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Data Points</span>
              <motion.button
                onClick={handleAddDataPoint}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="w-3.5 h-3.5" />
                Add Point
              </motion.button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {editingData.map((item) => (
                <motion.div
                  key={item.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <input
                    type="color"
                    value={item.color}
                    onChange={(e) => handleUpdateDataPoint(item.id, "color", e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => handleUpdateDataPoint(item.id, "label", e.target.value)}
                    className="flex-1 bg-background px-3 py-1.5 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="Label"
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => handleUpdateDataPoint(item.id, "value", e.target.value)}
                    className="w-24 bg-background px-3 py-1.5 rounded-lg border border-border outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="Value"
                  />
                  <motion.button
                    onClick={() => handleDeleteDataPoint(item.id)}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={editingData.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChartBlock;
