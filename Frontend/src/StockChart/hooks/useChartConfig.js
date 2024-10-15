/* src/hooks/useChartConfig.js */

import { useState, useEffect, useRef } from 'react';
import debounce from 'lodash.debounce';

const useChartConfig = () => {
  const [config, setConfig] = useState({
    dateFormat: '%Y-%m-%d',
    tickCount: 10,
  });

  // Ref to hold the latest config to prevent stale closures
  const configRef = useRef(config);

  // Update the ref whenever config changes
  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    // Function to determine date format and tick count based on window width
    const determineConfig = () => {
      const width = window.innerWidth;
      if (width > 1200) {
        return { dateFormat: '%Y-%m-%d', tickCount: 10 };
      } else if (width > 768) {
        return { dateFormat: '%b %d', tickCount: 7 };
      } else {
        return { dateFormat: '%m/%d', tickCount: 5 };
      }
    };

    // Initial config setting
    setConfig(determineConfig());

    // Debounced resize handler to optimize performance
    const handleResize = debounce(() => {
      const newConfig = determineConfig();
      const { dateFormat: currentFormat, tickCount: currentTicks } = configRef.current;
      if (
        newConfig.dateFormat !== currentFormat ||
        newConfig.tickCount !== currentTicks
      ) {
        setConfig(newConfig);
      }
    }, 100); // Adjust the delay as needed

    window.addEventListener('resize', handleResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      handleResize.cancel(); // Cancel any pending debounced calls
    };
  }, []);

  return config;
};

export default useChartConfig;
