/* src/components/TimeoutMessage.js */

import React from 'react';
import PropTypes from 'prop-types';

const TimeoutMessage = ({ retryAfter }) => {
  return (
    <div className="error-container">
      <h2>⏰ Timeout Occurred ⏰</h2>
      <p>
        We're having trouble fetching the stock data. Retrying in {retryAfter}{' '}
        second{retryAfter !== 1 ? 's' : ''}...
      </p>
    </div>
  );
};

TimeoutMessage.propTypes = {
  retryAfter: PropTypes.number.isRequired,
};

export default TimeoutMessage;
