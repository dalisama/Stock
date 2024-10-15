import React from 'react';
import PropTypes from 'prop-types';

const DataTable = ({ data, updateData }) => {
  // Handle input change
  const handleInputChange = (event, index) => {
    const newData = [...data];
    const newValue = parseFloat(event.target.value);
    if (!isNaN(newValue)) {
      newData[index].value = newValue;
      updateData(newData);
    }
  };

  return (
    <div className="data-table">
      <table>
        <thead>
          <tr>
            {data.map((row, index) => (
              <th key={index}>{row.date.toISOString().split('T')[0]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {data.map((row, index) => (
              <td key={index}>
                <input
                  type="number"
                  value={row.value}
                  onChange={(e) => handleInputChange(e, index)}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.instanceOf(Date),
      value: PropTypes.number,
    })
  ).isRequired,
  updateData: PropTypes.func.isRequired,
};

export default DataTable;
