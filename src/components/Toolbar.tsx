import React from "react";

interface ToolbarProps {
  tool: "text" | "draw";
  setTool: (tool: "text" | "draw") => void;
  color: string;
  setColor: (color: string) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ tool, setTool, color, setColor }) => {
  return (
    <div className="flex items-center justify-between mb-4 p-2 bg-gray-200 rounded">
      <div>
        <button
          onClick={() => setTool("text")}
          className={`px-4 py-2 mr-2 rounded ${
            tool === "text" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Text
        </button>
        <button
          onClick={() => setTool("draw")}
          className={`px-4 py-2 rounded ${
            tool === "draw" ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          Draw
        </button>
      </div>
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
        className="w-8 h-8 rounded"
      />
    </div>
  );
};

export default Toolbar;

