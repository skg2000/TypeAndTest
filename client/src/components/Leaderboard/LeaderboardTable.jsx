import "./Leaderboard.css";

function LeaderboardTable({ data }) {
  return (
    <div className="leaderboard-table">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>User</th>
            <th>WPM</th>
            <th>Accuracy</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={item._id}>
              <td>
  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
</td>
              <td>{item.user?.name || "Unknown"}</td>
              <td>{item.wpm}</td>
              <td>{item.accuracy}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardTable;