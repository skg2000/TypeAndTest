import { forwardRef } from "react";
import "./TypingInput.css";

const TypingInput = forwardRef(function TypingInput(
  { value = "", onChange, disabled = false },
  ref
) {
  return (
    <textarea
      ref={ref}
      className="typing-input"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Start typing here..."
      disabled={disabled}
      spellCheck={false}
    />
  );
});

export default TypingInput;