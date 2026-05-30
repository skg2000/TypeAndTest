import Hero         from "../../features/home/Hero";
import Features     from "../../features/home/Features";
import StatsCounter from "../../features/home/StatsCounter";
import Testimonials from "../../components/Testimonials/Testimonials";
import CtaBanner    from "../../features/home/CtaBanner";

function Home({ theme, toggleTheme }) {
  return (
    <>
      <Hero />
      <Features />
      <StatsCounter />
      <Testimonials />
      <CtaBanner />
    </>
  );
}

export default Home;
