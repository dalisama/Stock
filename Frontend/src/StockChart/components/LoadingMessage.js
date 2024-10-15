/* src/components/LoadingMessage.js */

import React from 'react';

const LoadingMessage = () => {
  return (
    <div className="loading-container">
      <div className="spinner">
        <div className="wheel wheel1"></div>
        <div className="wheel wheel2"></div>
      </div>
      <p>Loading stock data...</p>
    </div>
  );
};

export default LoadingMessage;
