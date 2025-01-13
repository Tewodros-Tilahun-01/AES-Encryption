import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./DecryptPage.css";

function DecryptPage() {
  const { id } = useParams();
  const [decryptedData, setDecryptedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enteredPassword, setEnteredPassword] = useState("");
  const [error, setError] = useState("");

  const handleDecrypt = async () => {
    try {
      const response = await axios.post(
        `https://aes-encryption.onrender.com/decrypt-password/${id}`,
        { enteredPassword }
      );
      setDecryptedData(response.data);
      setError(""); // Clear any previous errors
    } catch (error) {
      console.error("Error decrypting password:", error);
      setError("Failed to decrypt. Please check the access password.");
    }
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="decrypt-page">
      <h2>User Password</h2>
      <div className="input-section">
        <input
          type="password"
          value={enteredPassword}
          onChange={(e) => setEnteredPassword(e.target.value)}
          placeholder="Enter Access Password"
          className="input-field"
        />
        <button className="decrypt-button" onClick={handleDecrypt}>
          verify
        </button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {decryptedData && (
        <div className="decrypted-data">
          <h3>Website: {decryptedData.website}</h3>
          <p>Password: {decryptedData.password}</p>
        </div>
      )}
    </div>
  );
}

export default DecryptPage;
