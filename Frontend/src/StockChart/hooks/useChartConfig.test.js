// src/hooks/useChartConfig.test.js

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import useChartConfig from './useChartConfig';
import debounce from 'lodash.debounce';


// Mock lodash.debounce
jest.mock('lodash.debounce', () => jest.fn((fn) => {
  fn.cancel = jest.fn();
  return fn;
}));

describe('useChartConfig Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Utility to set window.innerWidth and dispatch resize event
  const setWindowWidth = (width) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    window.dispatchEvent(new Event('resize'));
  };

  // Test Component that uses the hook
  const TestComponent = () => {
    const config = useChartConfig();
    return (
      <div>
        <span data-testid="date-format">{config.dateFormat}</span>
        <span data-testid="tick-count">{config.tickCount}</span>
      </div>
    );
  };



  it('should clean up event listeners on unmount', () => {
    setWindowWidth(1300);
    const { unmount } = render(<TestComponent />);

    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    act(() => {
      unmount();
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should cancel debounce on unmount', () => {
    // Mock debounce to return a function with a cancel method
    debounce.mockImplementation((fn) => {
      fn.cancel = jest.fn();
      return fn;
    });

    setWindowWidth(1300);
    const { unmount } = render(<TestComponent />);

    const cancelMock = debounce.mock.results[0].value.cancel;

    act(() => {
      unmount();
    });

    expect(cancelMock).toHaveBeenCalled();
  });
});
