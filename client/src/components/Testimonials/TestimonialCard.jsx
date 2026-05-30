import "./Testimonials.css";

const COUNTRY_FLAGS = {
  IN:"🇮🇳",US:"🇺🇸",GB:"🇬🇧",DE:"🇩🇪",FR:"🇫🇷",JP:"🇯🇵",CN:"🇨🇳",BR:"🇧🇷",
  CA:"🇨🇦",AU:"🇦🇺",KR:"🇰🇷",RU:"🇷🇺",ES:"🇪🇸",IT:"🇮🇹",MX:"🇲🇽",PK:"🇵🇰",
  NG:"🇳🇬",SA:"🇸🇦",TR:"🇹🇷",ID:"🇮🇩",PH:"🇵🇭",VN:"🇻🇳",PL:"🇵🇱",NL:"🇳🇱",
  SE:"🇸🇪",NO:"🇳🇴",FI:"🇫🇮",DK:"🇩🇰",SG:"🇸🇬",MY:"🇲🇾",ZA:"🇿🇦",EG:"🇪🇬",
};

export function Stars({ count, interactive = false, onRate }) {
  return (
    <div className={`tc-stars${interactive ? " tc-stars-interactive" : ""}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={i < count ? "star filled" : "star"}
          onClick={interactive ? () => onRate(i + 1) : undefined}
          title={interactive ? `${i + 1} star${i ? "s" : ""}` : undefined}
        >★</span>
      ))}
    </div>
  );
}

function Avatar({ item }) {
  const initials = item.name
    ?.split(" ").map(w => w[0]?.toUpperCase() || "").slice(0, 2).join("") || "?";

  return item.avatar
    ? <img className="tc-avatar-img" src={item.avatar} alt={item.name} />
    : <div className="tc-avatar-initials" style={{ background: item.color || "#8b5cf6" }}>{initials}</div>;
}

function TestimonialCard({ item, active }) {
  const flag = COUNTRY_FLAGS[item.country] || "";

  return (
    <div className={`tc-card${active ? " tc-active" : ""}`}>
      <div className="tc-glow" style={{ background: item.color || "#8b5cf6" }} />

      <div className="tc-body">
        <span className="tc-quote">"</span>
        <p className="tc-review">{item.review}</p>
        <Stars count={item.rating} />

        <div className="tc-author">
          <div className="tc-avatar-wrap">
            <Avatar item={item} />
          </div>
          <div className="tc-author-info">
            <span className="tc-name">
              {item.name}
              {flag && <span className="tc-flag">{flag}</span>}
            </span>
            <span className="tc-role">{item.role || "TypeMaster User"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialCard;
