import { PropsWithChildren } from "react";
import "./styles/Landing.css";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1>
              ABDUL SAMI
              <br />
              <span>UTHWAL</span>
            </h1>
          </div>
          <div className="landing-info">
            <h3>A Dedicated</h3>
            <div className="landing-h2-wrapper">
              <h2 className="landing-info-h2">
                <div className="landing-h2-1">Software Engineer</div>
                <div className="landing-h2-2">AI Developer</div>
                <div className="landing-h2-3">Full Stack Developer</div>
                <div className="landing-h2-4">ML Enthusiast</div>
              </h2>
              <h2 className="landing-info-h2-foreground">
                <div className="landing-h2-info-1">Software Engineer</div>
                <div className="landing-h2-info-2">AI Developer</div>
                <div className="landing-h2-info-3">Full Stack Developer</div>
                <div className="landing-h2-info-4">ML Enthusiast</div>
              </h2>
            </div>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
