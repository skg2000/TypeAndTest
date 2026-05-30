import Navbar from "../../components/Navbar/Navbar";
import TypingBox from "./TypingBox";
import "./TypingPage.css";

function TypingPage({ theme, toggleTheme }) {
  return (
    <>
      <div className="typing-page">
        <div className="typing-page-header">
          <h1>Typing Test</h1>
          <p className="typing-subtitle">
            Practice freely — improve your speed and accuracy.
          </p>
        </div>
        <TypingBox />
      </div>
    </>
  );
}

export default TypingPage;
