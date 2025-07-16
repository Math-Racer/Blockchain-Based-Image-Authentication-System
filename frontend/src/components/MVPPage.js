import React, { useState } from "react";
import axios from "axios";
import "./MVPPage.css";

const MVPPage = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [result, setResult] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setImagePreview(null);
    }
  };

  const handleMetadataChange = (event) => {
    setMetadata(event.target.value);
  };

  const handleUpload = async () => {
    if (!file || !metadata) {
      alert("Please select an image and enter information of image!");
      return;
    }
    setStatusMessage("Uploading...");

    const formData = new FormData();
    formData.append("image", file);
    formData.append("metadata", metadata);

    try {
      const response = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);

      if (response.data) {
        setStatusMessage("Upload Success");
      } 
    } catch (error) {
      setStatusMessage("Upload Error");
      alert(
        error?.response?.data?.error || "Upload failed. Please try again."
      );
      console.error(error);
    }
  };

  const handleVerify = async () => {
    if (!result?.hash) {
      alert("No uploaded image hash to verify!");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/verify", {
        hash: result.hash,
      });

      if (response.data.verified) {
        setVerificationData(response.data);
        alert(
          `Image Verified!\nInformation of Image: ${response.data.metadata}\nTimestamp: ${new Date(
            response.data.timestamp * 1000
          ).toLocaleString()}`
        );
      } else {
        alert("Image not found");
      }
    } catch (error) {
      alert("Verification failed");
      console.error(error);
    }
  };

  return (
    <main className="mvp-main">
      <div className="mvp-card">
        <h2>Blockchain Based Image Authorization</h2>


        <div className="form-group">
          <label>
            Select Image:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
          </div>
        )}

        <div className="form-group">
          <label>
            Information of Image:
            <input
              type="text"
              value={metadata}
              onChange={handleMetadataChange}
              placeholder="Enter information of image (e.g., location, description)"
            />
          </label>
        </div>

        <div className="button-group">
          <button className="btn btn-primary" onClick={handleUpload}>
            Upload
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleVerify}
            disabled={!result}
          >
            Verify Image
          </button>
        </div>

        {statusMessage && (
          <p
            className={`status-message ${
              statusMessage.toLowerCase().includes("error")
                ? "error"
                : "success"
            }`}
          >
            {statusMessage}
          </p>
        )}

        {result && (
          <div className="details-card">
            <h4>Upload Details</h4>
            <p>
              <strong>Image Hash:</strong> {result.hash}
            </p>
            <p>
              <strong>Status: Uploaded</strong>
            </p>
            <p>
              <strong>Transaction Hash:</strong> {result.tx_hash}
            </p>
          </div>
        )}

        {verificationData && (
          <div className="details-card">
            <h4>Verification Details</h4>
            <p>
              <strong>Status:</strong>{" "}
              {verificationData.verified ? "Verified" : "Not Verified"}
            </p>
            <p>
              <strong>Information of Image:</strong> {verificationData.metadata}
            </p>
            <p>
              <strong>Timestamp:</strong>{" "}
              {new Date(verificationData.timestamp * 1000).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

export default MVPPage;
