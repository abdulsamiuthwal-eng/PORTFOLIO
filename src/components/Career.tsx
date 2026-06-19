import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI & Software Developer</h4>
                <h5>Freelance & Academic Projects</h5>
              </div>
              <h3>2024 - PRES</h3>
            </div>
            <p>
              Working on intelligent software systems, AI applications, and full-stack development projects. Experienced in computer vision, document intelligence systems, automation solutions, and modern web technologies.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Engineering Student</h4>
                <h5>University Projects & Research</h5>
              </div>
              <h3>2022 - PRES</h3>
            </div>
            <p>
              Actively involved in software engineering projects, research work, and AI-based system development. Focused on practical implementations of machine learning, computer vision, and software engineering principles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
