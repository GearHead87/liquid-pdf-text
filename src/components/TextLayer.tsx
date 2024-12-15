import React, { useState } from "react";
import { Text } from "react-pdf-editor";

interface TextLayerProps {
  tool: "text" | "draw";
}

const TextLayer: React.FC<TextLayerProps> = ({ tool }) => {
  const [texts, setTexts] = useState<{ id: string; content: string; x: number; y: number }[]>([]);

  const handleAddText = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tool === "text") {
      const newText = {
        id: Date.now().toString(),
        content: "New Text",
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
      setTexts([...texts, newText]);
    }
  };

  return (
    <div
      className="absolute top-0 left-0 w-full h-full"
      onClick={handleAddText}
    >
      {texts.map((text) => (
        <Text
          key={text.id}
          x={text.x}
          y={text.y}
          content={text.content}
          onUpdate={(newContent) => {
            setTexts(
              texts.map((t) =>
                t.id === text.id ? { ...t, content: newContent } : t
              )
            );
          }}
        />
      ))}
    </div>
  );
};

export default TextLayer;

