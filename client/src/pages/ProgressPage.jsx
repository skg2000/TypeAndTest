import { useEffect, useState } from "react";
import { getMyResults } from "../api/resultApi";

import ProgressChart from "../components/Progress/ProgressChart";
import ProgressTable from "../components/Progress/ProgressTable";

import "../components/Progress/Progress.css";

function ProgressPage() {
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const data = await getMyResults();
      setResults(data);
    } catch (err) {
      console.error("Error fetching results:", err);
    }
  };

  return (
    <div className="progress-page">
      <h1>Your Progress</h1>

      {results.length === 0 ? (
        <p>No data yet. Start typing!</p>
      ) : (
        <>
          <ProgressChart results={results} />
          <ProgressTable results={results} />
        </>
      )}
    </div>
  );
}

export default ProgressPage;