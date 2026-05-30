import "./TypingDisplay.css";

function TypingDisplay({ text = "", input = "" }) {
  const currentIndex = input.length;

  return (
    <div className="typing-display">
      {text.split("").map((char, index) => {
        let className = "";

        if (index < input.length) {
          className = input[index] === char ? "correct-char" : "incorrect-char";
        } else if (index === currentIndex) {
          className = "caret-char";
        }

        return (
          <span key={index} className={className}>
            {char === " " ? <span className="space"> </span> : char}
          </span>
        );
      })}
    </div>
  );
}

export default TypingDisplay;