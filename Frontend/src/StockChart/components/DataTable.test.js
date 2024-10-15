import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import DataTable from './DataTable';

describe('DataTable Component', () => {
  const sampleData = [
    { date: new Date('2021-01-01'), value: 100 },
    { date: new Date('2021-01-02'), value: 200 },
    { date: new Date('2021-01-03'), value: 300 },
  ];

  

  it('calls updateData when an input value changes', () => {
    const mockUpdateData = jest.fn();
    const { getAllByRole } = render(
      <DataTable data={sampleData} updateData={mockUpdateData} />
    );

    const inputs = getAllByRole('spinbutton');

    // Change the value of the first input
    fireEvent.change(inputs[0], { target: { value: '150' } });

    // Check that updateData was called with the updated data
    expect(mockUpdateData).toHaveBeenCalledTimes(1);
    const updatedData = mockUpdateData.mock.calls[0][0];

    // Verify that the updatedData has the new value
    expect(updatedData[0].value).toBe(150);
    // The other values should remain the same
    expect(updatedData[1].value).toBe(200);
    expect(updatedData[2].value).toBe(300);
  });

  it('does not call updateData when input value is invalid', () => {
    const mockUpdateData = jest.fn();
    const { getAllByRole } = render(
      <DataTable data={sampleData} updateData={mockUpdateData} />
    );

    const inputs = getAllByRole('spinbutton');

    // Try to change the value of the first input to an invalid value
    fireEvent.change(inputs[0], { target: { value: 'abc' } });

    // updateData should not have been called
    expect(mockUpdateData).not.toHaveBeenCalled();
  });
});
