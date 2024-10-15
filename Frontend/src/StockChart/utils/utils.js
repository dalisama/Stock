/* src/utils/utils.js */

// Function to add trend information to data
export const addTrendInfo = (data) => {
    return data.map((d, i) => {
      if (i === 0) {
        return { ...d, trend: 'neutral' }; // First data point has no trend
      }
      return {
        ...d,
        trend: d.value >= data[i - 1].value ? 'up' : 'down',
      };
    });
  };
  
  // Function to split data into segments based on trend (for drawing paths)
  export const getSegments = (data) => {
    const segments = [];
    if (data.length === 0) return segments;
  
    let currentSegment = [data[0]];
    let currentTrend = data[0].trend; // Initialize with the first point's trend
  
    for (let i = 1; i < data.length; i++) {
      const prev = data[i - 1];
      const current = data[i];
      const trend = current.trend;
  
      if (trend === currentTrend) {
        currentSegment.push(current);
      } else {
        segments.push({ trend: currentTrend, data: [...currentSegment] });
        currentSegment = [prev, current]; // Start new segment with overlapping point
        currentTrend = trend;
      }
    }
    segments.push({ trend: currentTrend, data: [...currentSegment] });
  
    return segments;
  };
  