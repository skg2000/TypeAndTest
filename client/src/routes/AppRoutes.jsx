import { Routes, Route } from "react-router-dom";
import Home          from "../pages/Home/Home";
import TypingPage    from "../features/typingTest/TypingPage";
import RacePage      from "../pages/Race/RacePage";
import Login         from "../features/auth/Login";
import Register      from "../features/auth/Register";
import Dashboard     from "../pages/Dashboard/Dashboard";
import ProgressPage  from "../pages/ProgressPage";
import LeaderboardPage from "../pages/LeaderboardPage";
import AchievementsPage from "../pages/AchievementsPage";
import ProfilePage   from "../pages/Profile/ProfilePage";
import AnalyticsPage from "../pages/Analytics/AnalyticsPage";
import FriendsPage   from "../pages/Friends/FriendsPage";
import CoachPage     from "../pages/Coach/CoachPage";
import LessonsPage   from "../features/lessons/pages/LessonsPage";
import GamesPage     from "../pages/Games/GamesPage";
import Navbar        from "../components/Navbar/Navbar";
import Footer        from "../components/Footer/Footer";

function Layout({ children, theme, toggleTheme }) {
  return (
    <>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      {children}
      <Footer />
    </>
  );
}

function AppRoutes({ theme, toggleTheme }) {
  const wrap = (el) => <Layout theme={theme} toggleTheme={toggleTheme}>{el}</Layout>;

  return (
    <Routes>
      <Route path="/"            element={wrap(<Home theme={theme} toggleTheme={toggleTheme} />)} />
      <Route path="/typing-test" element={wrap(<TypingPage theme={theme} toggleTheme={toggleTheme} />)} />
      <Route path="/race"        element={<RacePage theme={theme} toggleTheme={toggleTheme} />} />
      <Route path="/login"       element={<Login />} />
      <Route path="/register"    element={<Register />} />
      <Route path="/dashboard"   element={wrap(<Dashboard />)} />
      <Route path="/progress"    element={wrap(<ProgressPage />)} />
      <Route path="/leaderboard" element={wrap(<LeaderboardPage theme={theme} toggleTheme={toggleTheme} />)} />
      <Route path="/achievements"element={wrap(<AchievementsPage />)} />
      <Route path="/profile/:username" element={wrap(<ProfilePage />)} />
      <Route path="/analytics"   element={wrap(<AnalyticsPage />)} />
      <Route path="/friends"     element={wrap(<FriendsPage />)} />
      <Route path="/coach"       element={wrap(<CoachPage />)} />
      <Route path="/lessons"     element={wrap(<LessonsPage />)} />
      <Route path="/games"       element={wrap(<GamesPage />)} />
    </Routes>
  );
}

export default AppRoutes;
