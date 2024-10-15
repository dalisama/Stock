/* src/components/Legend.js */

import React from 'react';

const Legend = () => {
  return (
    <div className="legend">
      <div className="legend-item">
        <span className="legend-icon up">&#9650;</span>
        <span className="legend-label">Upward Trend</span>
      </div>
      <div className="legend-item">
        <span className="legend-icon down">&#9660;</span>
        <span className="legend-label">Downward Trend</span>
      </div>
      <div className="legend-item">
        <span className="legend-icon neutral">&#8213;</span>
        <span className="legend-label">Neutral</span>
      </div>
    </div>
  );
};

export default Legend;
