import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import DecryptPage from "./DecryptPage";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

ReactDOM.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/decrypt/:id" element={<DecryptPage />} />
    </Routes>
  </Router>,
  document.getElementById("root")
);
