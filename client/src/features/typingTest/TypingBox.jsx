import { useEffect, useRef, useState } from "react";
import generateText from "../../utils/textGenerator";
import calculateWPM from "../../utils/calculateWPM";
import calculateAccuracy from "../../utils/calculateAccuracy";
import { saveResult } from "../../api/resultApi";

import TypingControls from "./TypingControls";
import TypingStats from "./TypingStats";
import TypingDisplay from "./TypingDisplay";
import TypingInput from "./TypingInput";
import ResultModal from "../../components/ResultModal/ResultModal";
import AchievementPopup from "../../components/Achievements/AchievementPopup";

import "./TypingBox.css";

function TypingBox() {
  const [mode, setMode]         = useState("medium");
  const [time, setTime]         = useState(15);
  const [timeLeft, setTimeLeft] = useState(15);
  const [newAchievements, setNewAchievements] = useState([]);

  const getWordCount = (t) => (t === 15 ? 20 : t === 30 ? 35 : 65);

  const [text, setText]       = useState(generateText(getWordCount(15), "medium"));
  const [input, setInput]     = useState("");
  const [startTime, setStartTime] = useState(null);
  const [wpm, setWpm]         = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [result, setResult]   = useState(null);
  const [mute, setMute]       = useState(false);

  const textareaRef      = useRef(null);
  const hasFinishedRef   = useRef(false);

  /* ── Live stats ── */
  useEffect(() => {
    if (!startTime || input.length === 0) return;
    const correctChars = input.split("").filter((c, i) => c === text[i]).length;
    setWpm(calculateWPM(input.length, startTime));
    setAccuracy(calculateAccuracy(correctChars, input.length));
  }, [input, startTime, text]);

  /* ── Timer ── */
  useEffect(() => {
    if (!startTime || timeLeft <= 0 || hasFinishedRef.current) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasFinishedRef.current) { hasFinishedRef.current = true; finishTest(); }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime, timeLeft]);

  /* ── Achievement popup auto-dismiss ── */
  useEffect(() => {
    if (!newAchievements.length) return;
    const t = setTimeout(() => setNewAchievements([]), 3500);
    return () => clearTimeout(t);
  }, [newAchievements]);

  /* ── Finish test ── */
  const finishTest = async () => {
    const finalWpm = startTime ? calculateWPM(input.length, startTime) : 0;
    const correctChars = input.split("").filter((c, i) => c === text[i]).length;
    const finalAccuracy = input.length > 0 ? calculateAccuracy(correctChars, input.length) : 100;
    const finalResult = { wpm: finalWpm, accuracy: finalAccuracy, characters: input.length, time, mode };
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    setResult(finalResult);
    if (input.trim().length < 5) return;
    try {
      const res = await saveResult(finalResult);
      setNewAchievements(res.unlockedAchievements || []);
    } catch (err) {
      console.error("Failed to save result:", err);
    }
  };

  /* ── Input change ── */
  const handleChange = (value) => {
    if (timeLeft === 0) return;
    if (!startTime && value.length === 1) setStartTime(Date.now());
    setInput(value);
  };

  /* ── Restart ── */
  const restartTest = (newMode = mode, newTime = time) => {
    hasFinishedRef.current = false;
    setMode(newMode);
    setTime(newTime);
    setTimeLeft(newTime);
    setText(generateText(getWordCount(newTime), newMode));
    setInput("");
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setResult(null);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  /* ── Auto-focus ── */
  useEffect(() => { textareaRef.current?.focus(); }, []);

  return (
    /* typing-box gets flex:1 + flex-column from TypingPage.css */
    <div className="typing-box" onClick={() => textareaRef.current?.focus()}>

      <div className="typing-controls-wrap">
        <TypingControls
          mode={mode} time={time} mute={mute} setMute={setMute}
          onModeChange={(m) => restartTest(m, time)}
          onTimeChange={(t) => restartTest(mode, t)}
          onRestart={restartTest}
        />
      </div>

      <div className="typing-stats-wrap">
        <TypingStats timeLeft={timeLeft} wpm={wpm} accuracy={accuracy} />
      </div>

      <div className="typing-display-wrap">
        <TypingDisplay text={text} input={input} />
      </div>

      <div className="typing-input-wrap">
        <TypingInput
          ref={textareaRef}
          value={input}
          onChange={handleChange}
          disabled={timeLeft === 0}
        />
      </div>

      {result && <ResultModal result={result} onClose={() => setResult(null)} />}
      <AchievementPopup achievements={newAchievements} />
    </div>
  );
}

export default TypingBox;
