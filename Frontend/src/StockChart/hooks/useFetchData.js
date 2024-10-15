/* src/hooks/useFetchData.js */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { addTrendInfo } from '../utils/utils';

const useFetchData = (dataUrl) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null); // Holds error object
  const [retryAfter, setRetryAfter] = useState(10); // Countdown for timeout
  const retryTimeoutRef = useRef(null); // Reference to timeout for cleanup

  const fetchData = () => {
    axios
      .get(dataUrl, { timeout: 5000 }) // Set timeout to 5 seconds
      .then((response) => {
        let fetchedData = response.data.slice(-20)
          .map((item) => ({
            date: new Date(item.timestamp),
            value: parseFloat(item.stocks),
          }))
          .sort((a, b) => a.date - b.date); // Ensure data is sorted by date

        // Add trend information
        fetchedData = addTrendInfo(fetchedData);
        setData(fetchedData);
        setError(null); // Reset any previous errors
      })
      .catch((error) => {
        if (error.code === 'ECONNABORTED') {
          // Handle timeout
          handleTimeoutError();
        } else if (error.response && error.response.status === 404) {
          // Handle 404
          setError({ type: '404', message: 'Data not found (404).' });
        } else {
          // Handle other errors
          setError({
            type: 'general',
            message:
              "It looks like the code took a nap and forgot what it was doing... Don't worry, our team of squirrels is working tirelessly to fix it. try hitting Retry (maybe it'll wake the code up). 🚀",
          });
        }
      });
  };

  const handleTimeoutError = () => {
    setError({ type: 'timeout', message: 'Request timed out.' });
    setRetryAfter(10); // Start countdown from 10 seconds

    // Start countdown
    retryTimeoutRef.current = setInterval(() => {
      setRetryAfter((prev) => {
        if (prev === 1) {
          clearInterval(retryTimeoutRef.current);
          fetchData(); // Retry fetching data
          return 10; // Reset for next potential timeout
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    fetchData();

    // Cleanup on unmount
    return () => {
      if (retryTimeoutRef.current) {
        clearInterval(retryTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataUrl]);

  return { data, error, retryAfter, fetchData };
};

export default useFetchData;
