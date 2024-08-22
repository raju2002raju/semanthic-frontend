import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
        setIsLoading(true);
        const response = await axios.post('https://samentic-ai-backend.onrender.com/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Upload response:', response.data); // Log response data
        if (response.data && response.data.paragraphs && response.data.paragraphs.length > 0) {
            setExtractedText(response.data.paragraphs);
            setErrorMessage('');
        } else {
            setErrorMessage('No text was extracted from the PDF.');
        }
        setSelectedFile(null);
    } catch (error) {
        console.error('Error uploading the file:', error);
        if (error.response) {
            setErrorMessage(error.response.data.error || 'An error occurred during the file upload.');
        } else {
            setErrorMessage('An error occurred during the file upload. Please try again later.');
        }
    } finally {
        setIsLoading(false);
    }
};


  const handleSearch = async () => {
    if (searchQuery.trim() === '' || extractedText.length === 0) return;
    try {
      setIsLoading(true);
      const response = await axios.post('https://samentic-ai-backend.onrender.com/search', {
        query: searchQuery,
        paragraphs: extractedText,
      });

      console.log('Search response:', response.data); // Log response data
      if (response.data && response.data.question && response.data.answer) {
        setSearchHistory((prevHistory) => [
          { question: response.data.question, answer: response.data.answer },
          ...prevHistory,
        ]);
        setSearchQuery('');
        setErrorMessage('');
      } else {
        setErrorMessage('Unexpected response structure.');
      }
    } catch (error) {
      console.error('Error performing search:', error);
      setErrorMessage('An error occurred during the search. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className='file_upload_container'>
        <h1>PDF Upload and Search</h1>
        <div>
          <input type="file" onChange={handleFileChange} accept=".pdf" />
          <button onClick={handleSubmit} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Uploading...' : 'Upload PDF'}
          </button>
        </div>
        {errorMessage && (
          <div>
            <p style={{ color: 'red' }}>{errorMessage}</p>
          </div>
        )}
        {extractedText.length > 0 && (
          <div className='extract-text'>
            <h3>Extracted Text:</h3>
            {extractedText.map((paragraph, index) => (
              <div key={index}>
                <p>{paragraph}</p>
                <hr />
              </div>
            ))}
          </div>
        )}
      </div>
      <hr />
      <div className='search_container'>
        <div className='input_Btn'>
          <div className='s-align'>
            <h1>Search Result:</h1>
            {searchHistory.length > 0 && (
              <div>
                <h3>Search History:</h3>
                {searchHistory.map((item, index) => (
                  <div key={index}>
                    <h4>Question:</h4>
                    <p>{item.question}</p>
                    <h4>Answer:</h4>
                    <p>{item.answer}</p>
                    <hr />
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter your search query"
            />
            <button onClick={handleSearch} disabled={isLoading || extractedText.length === 0}>
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
