import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

Modal.setAppElement("#root");

function App() {
  const [websites, setWebsites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [site, setSite] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Fetch websites on component mount
  useEffect(() => {
    const fetchWebsites = async () => {
      try {
        const response = await axios.get("http://localhost:5000/websites");
        setWebsites(response.data);
      } catch (error) {
        console.error("Error fetching websites:", error);
      }
    };

    fetchWebsites();
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSave = async () => {
    try {
      const response = await axios.post("http://localhost:5000/add-website", {
        website: site,
        password,
      });
      if (response.status === 200) {
        // Fetch updated websites after adding
        const updatedResponse = await axios.get(
          "http://localhost:5000/websites"
        );
        setWebsites(updatedResponse.data);
        setSite("");
        setPassword("");
        closeModal();
      } else {
        console.error("Failed to save website");
      }
    } catch (error) {
      console.error("Error adding website:", error);
    }
  };

  const handleDecrypt = (id) => {
    navigate(`/decrypt/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/delete-website/${id}`
      );
      if (response.status === 200) {
        // Update websites list after deletion
        setWebsites(websites.filter((website) => website._id !== id));
      } else {
        console.error("Failed to delete website");
      }
    } catch (error) {
      console.error("Error deleting website:", error);
    }
  };

  return (
    <div className="App">
      <button className="add-button" onClick={openModal}>
        Add New Password
      </button>

      <div className="websites-list">
        <h2>Your Saved Websites</h2>
        {websites.length > 0 ? (
          <ul>
            {websites.map((website) => (
              <li key={website._id}>
                <span>{website.website}</span>
                <div>
                  <button onClick={() => handleDecrypt(website._id)}>
                    show password
                  </button>
                  <button
                    onClick={() => handleDelete(website._id)}
                    className="delete-button"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No websites added yet.</p>
        )}
      </div>

      {/* Modal for adding a website */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
      >
        <h2>Add New Password</h2>
        <form className="modal-form">
          <label>
            Site
            <input
              type="text"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={closeModal}>
              Cancel
            </button>
            <button type="button" className="save-btn" onClick={handleSave}>
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;
