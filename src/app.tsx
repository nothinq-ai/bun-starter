import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { ExamplePage } from "./pages/example";
import { ThemeProvider } from "./components/theme-provider";
import "./globals.css";

export function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<ExamplePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
