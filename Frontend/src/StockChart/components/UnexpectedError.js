import React from 'react';
import PropTypes from 'prop-types';

const UnexpectedError = ({ errorMessage, onRetry }) => {
  return (
    <div className="error-container">
      <h2>⚠️ Oops! An Unexpected Error Occurred! ⚠️</h2>
      <p>{errorMessage}</p>
      <button onClick={onRetry} className="retry-button">
        Retry
      </button>
    </div>
  );
};

UnexpectedError.propTypes = {
  errorMessage: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default UnexpectedError;
