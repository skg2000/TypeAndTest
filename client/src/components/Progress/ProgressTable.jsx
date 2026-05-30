function ProgressTable({ results }) {
  return (
    <div className="progress-table">
      <h2>Recent Tests</h2>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>WPM</th>
            <th>Accuracy</th>
            <th>Mode</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {results.slice(0, 10).map((r) => (
            <tr key={r._id}>
              <td>{new Date(r.createdAt).toLocaleDateString()}</td>
              <td>{r.wpm}</td>
              <td>{r.accuracy}%</td>
              <td>{r.mode}</td>
              <td>{r.time}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProgressTable;