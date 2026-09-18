import { assignment } from '../data/assignment';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="footer-name">{assignment.appName}</span>
          <span className="footer-tagline">
            {assignment.courseName}
          </span>
        </div>
        <div className="footer-detail">
          <span>
            {assignment.assignment} – {assignment.set}
          </span>
          <span>
            {assignment.studentId} {assignment.studentName}
          </span>
        </div>
        <p className="footer-note">
          Interactive engineering calculation tool for academic analysis.
        </p>
        <p className="footer-disclaimer">
          Calculations use idealized thermodynamic models (cold-air-standard Diesel cycle) and
          standard steam-table values for the specified Rankine assignment state points.
        </p>
      </div>
    </footer>
  );
}