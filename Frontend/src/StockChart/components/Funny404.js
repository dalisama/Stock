/* src/components/Funny404.js */

import React from 'react';
import PropTypes from 'prop-types';

const Funny404 = ({ onRetry }) => {
  return (
    <div className="error-container">
      <h2>🚫 Oops! Page Not Found 🚫</h2>
      <p>Looks like the stocks are hiding somewhere.</p>
      <button onClick={onRetry} className="retry-button">
        Retry
      </button>
    </div>
  );
};

Funny404.propTypes = {
  onRetry: PropTypes.func.isRequired,
};

export default Funny404;
