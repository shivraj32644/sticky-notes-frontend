import React, { useEffect, useRef, useState } from "react";
import { Bold, Italic, Underline, List } from "lucide-react";
import { cn } from "../../../lib/utils";

interface RichTextEditorProps {
  initialContent: string;
  onUpdate: (content: string) => void;
  className?: string;
  textColorClass?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  initialContent,
  onUpdate,
  className,
  textColorClass,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize content only once to avoid cursor jumping on re-renders
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== initialContent) {
      // Only set if completely empty or strictly necessary to avoid loops
      // Simple check: if empty and initial has value
      if (!editorRef.current.innerText.trim() && initialContent) {
        editorRef.current.innerHTML = initialContent;
      }
    }
  }, []);

  const handleInput = () => {
    if (editorRef.current) {
      onUpdate(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {isFocused && (
        <div className="flex items-center gap-1 mb-1 p-1 bg-black/5 rounded-md transition-opacity animate-in fade-in zoom-in duration-200">
          <button
            onClick={() => execCommand("bold")}
            className="p-1 hover:bg-black/10 rounded"
            title="Bold"
          >
            <Bold size={14} className={textColorClass} />
          </button>
          <button
            onClick={() => execCommand("italic")}
            className="p-1 hover:bg-black/10 rounded"
            title="Italic"
          >
            <Italic size={14} className={textColorClass} />
          </button>
          <button
            onClick={() => execCommand("underline")}
            className="p-1 hover:bg-black/10 rounded"
            title="Underline"
          >
            <Underline size={14} className={textColorClass} />
          </button>
          <button
            onClick={() => execCommand("insertUnorderedList")}
            className="p-1 hover:bg-black/10 rounded"
            title="List"
          >
            <List size={14} className={textColorClass} />
          </button>
        </div>
      )}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={cn(
          "flex-1 outline-none text-sm min-h-[80px] cursor-text empty:before:content-['Type_notes_here...'] empty:before:text-gray-400 empty:before:italic",
          textColorClass
        )}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
        dangerouslySetInnerHTML={{ __html: initialContent }}
      />
    </div>
  );
};
