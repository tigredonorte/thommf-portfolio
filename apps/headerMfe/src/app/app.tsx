import './app.scss';

export function App() {
  return (
    <header className="header">
      <div className="brand">
        <h1>Your Name</h1>
        <p>Software Developer</p>
      </div>
      <nav>
        <a href="/">Projects</a>
        <a href="/">About Me</a>
        <a href="/">Contact</a>
      </nav>
    </header>
  );
}

export default App;