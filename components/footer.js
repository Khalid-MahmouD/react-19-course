import Bs from "./bluesky";
import Gh from "./github";
import Li from "./linkedin";
import ThemeIcons from "./themeicons";
import Tw from "./twitter";

export default function Footer({ twitter, linkedin, github, bluesky }) {
  return (
    <footer className="footer">
      <ul className="socials">
        {twitter ? (
          <li className="social">
            <a href={`https://twitter.com/${twitter}`}>
              <Tw />
            </a>
          </li>
        ) : null}
        {bluesky ? (
          <li className="social">
            <a href={`https://bsky.app/profile/${bluesky}`}>
              <Bs />
            </a>
          </li>
        ) : null}
        {github ? (
          <li className="social">
            <a href={`https://github.com/${github}`}>
              <Gh />
            </a>
          </li>
        ) : null}
        {linkedin ? (
          <li className="social">
            <a href={`https://linkedin.com/in/${linkedin}`}>
              <Li />
            </a>
          </li>
        ) : null}
        <li className="social">
          <div className="terms" />{" "}
        </li>
      </ul>
      <div className="theme-icons">
        <ThemeIcons />
      </div>
    </footer>
  );
}
