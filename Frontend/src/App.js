import React from 'react';
import './App.scss';
import StockChart from './StockChart/StockChart.js';

function App() {
  return (
    <div className="App">
      <div className='header'>
      <h2>Stock Market Line Chart</h2>
      </div>
   
    <div className="App">
      <StockChart dataUrl="http://localhost:3000/stocks?limit=20" />
      </div></div>
  );
}

export default App;
