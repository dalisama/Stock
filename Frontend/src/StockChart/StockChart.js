/* src/StockChart.js */

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import './scss/StockChart.scss';

import Funny404 from './components/Funny404';
import TimeoutMessage from './components/TimeoutMessage';
import LoadingMessage from './components/LoadingMessage';
import UnexpectedError from './components/UnexpectedError';
import Legend from './components/Legend';
import Tooltip from './components/Tooltip';
import DataTable from './components/DataTable';
import useChartConfig from './hooks/useChartConfig';
import useFetchData from './hooks/useFetchData';
import { getSegments, addTrendInfo } from './utils/utils';

function StockChart({ dataUrl = '/stocks' }) {
  const chartRef = useRef();
  const config = useChartConfig();
  const { data: fetchedData, error, retryAfter, fetchData } = useFetchData(dataUrl);

  // State to manage data, initialized with fetchedData
  const [data, setData] = useState([]);

  // Update state when fetchedData changes
  useEffect(() => {
    if (fetchedData.length > 0) {
      setData(fetchedData);
    }
  }, [fetchedData]);

  // Function to update data from DataTable
  const updateData = (newData) => {
    // Sort data by date
    newData.sort((a, b) => a.date - b.date);
    // Recalculate trend information
    const dataWithTrend = addTrendInfo(newData);
    setData(dataWithTrend);
  };

  const drawChart = () => {
    // Clear any existing SVG
    d3.select(chartRef.current).select('svg').remove();

    const containerWidth = chartRef.current.clientWidth;
    const containerHeight = 500; // Fixed height; adjust as needed or make dynamic

    // Define margins
    const margin = { top: 60, right: 60, bottom: 80, left: 60 };

    // Create SVG container with responsive settings
    const svg = d3
      .select(chartRef.current)
      .append('svg')
      .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .classed('responsive-svg', true);

    // Define scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([margin.left, containerWidth - margin.right]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(data, (d) => d.value) * 0.95,
        d3.max(data, (d) => d.value) * 1.05,
      ])
      .nice()
      .range([containerHeight - margin.bottom, margin.top]);

    // Calculate xTicks based on config.tickCount
    const xTicks = config.tickCount;

    // Add gridlines
    const yGrid = d3
      .axisLeft(y)
      .ticks(10)
      .tickSize(-containerWidth + margin.left + margin.right)
      .tickFormat('');

    svg
      .append('g')
      .attr('class', 'grid grid--y')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yGrid);

    const xGrid = d3
      .axisBottom(x)
      .ticks(xTicks)
      .tickSize(-containerHeight + margin.top + margin.bottom)
      .tickFormat('');

    svg
      .append('g')
      .attr('class', 'grid grid--x')
      .attr('transform', `translate(0,${containerHeight - margin.bottom})`)
      .call(xGrid);

    // Define gradient for area
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', margin.left)
      .attr('y1', y(d3.max(data, (d) => d.value)))
      .attr('x2', margin.left)
      .attr('y2', y(d3.min(data, (d) => d.value)));

    gradient
      .append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#42a5f5');

    gradient
      .append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#1e88e5');

    // Define area generator
    const area = d3
      .area()
      .x((d) => x(d.date))
      .y0(y(d3.min(data, (d) => d.value)))
      .y1((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Create a clipping rectangle for animation
    const clip = svg
      .append('defs')
      .append('SVG:clipPath')
      .attr('id', 'clip')
      .append('rect')
      .attr('width', 0)
      .attr('height', containerHeight)
      .attr('x', margin.left)
      .attr('y', 0);

    // Create a group for chart content and apply clipping
    const content = svg.append('g').attr('clip-path', 'url(#clip)');

    // Append area under the line
    content
      .append('path')
      .datum(data)
      .attr('fill', 'url(#area-gradient)')
      .attr('opacity', 0.3)
      .attr('d', area);

    // Split data into segments based on trend
    const segments = getSegments(data);

    // Define line generator
    const line = d3
      .line()
      .x((d) => x(d.date))
      .y((d) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Append paths for each segment with appropriate color
    content
      .selectAll('.segment')
      .data(segments)
      .enter()
      .append('path')
      .attr('class', 'segment')
      .attr('fill', 'none')
      .attr('stroke', (d) =>
        d.trend === 'up' ? 'green' : d.trend === 'down' ? 'red' : '#1e88e5'
      )
      .attr('stroke-width', 3)
      .attr('d', (d) => line(d.data));

    // Animate the clipping rectangle to reveal the chart
    clip
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr('width', containerWidth - margin.left - margin.right);

    // Add circles at data points with colors based on trend
    content
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.value))
      .attr('r', 4)
      .attr('fill', (d) => {
        if (d.trend === 'up') return 'green';
        if (d.trend === 'down') return 'red';
        return '#1e88e5'; // Neutral color for first data point
      });

    // Tooltip setup
    const tooltip = d3.select('#tooltip');

    // Function to get relative position
    const getRelativePosition = (event, container) => {
      const rect = container.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    // Function to constrain tooltip within the container
    const constrainTooltip = (
      tooltipWidth,
      tooltipHeight,
      posX,
      posY,
      containerWidth,
      containerHeight
    ) => {
      let left = posX + 10;
      let top = posY - tooltipHeight - 10;

      // Prevent tooltip from overflowing to the right
      if (left + tooltipWidth > containerWidth) {
        left = posX - tooltipWidth - 10;
      }

      // Prevent tooltip from overflowing to the top
      if (top < 0) {
        top = posY + 10;
      }

      // Prevent tooltip from overflowing to the left
      if (left < 0) {
        left = 10;
      }

      // Prevent tooltip from overflowing to the bottom
      if (top + tooltipHeight > containerHeight) {
        top = containerHeight - tooltipHeight - 10;
      }

      return { left, top };
    };

    // Function to get trend icon based on trend
    const getTrendIcon = (trend) => {
      if (trend === 'up') {
        return '<span class="tooltip-trend-icon up">&#9650;</span>'; // Up arrow
      } else if (trend === 'down') {
        return '<span class="tooltip-trend-icon down">&#9660;</span>'; // Down arrow
      } else {
        return '<span class="tooltip-trend-icon neutral">&#8213;</span>'; // Dash for neutral
      }
    };

    // Add interactivity for tooltips
    content
      .selectAll('.dot')
      .on('mouseenter touchstart', function (event, d) {
        d3.select(this).attr('r', 6).attr('fill', '#ff5722');

        // Get mouse/touch position
        let pos;
        if (event.type.startsWith('touch')) {
          const touch = event.touches[0] || event.changedTouches[0];
          pos = getRelativePosition(touch, chartRef.current);
        } else {
          pos = getRelativePosition(event, chartRef.current);
        }

        // Set tooltip content with trend icon
        tooltip.html(
          `${getTrendIcon(d.trend)}<br/><strong>Date:</strong> ${d3.timeFormat(
            config.dateFormat
          )(d.date)}<br/><strong>Value:</strong> ${d.value}`
        );

        // Show tooltip to get its dimensions
        tooltip.style('opacity', 0.9).style('display', 'block');

        // Get tooltip dimensions
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode.offsetWidth;
        const tooltipHeight = tooltipNode.offsetHeight;

        // Constrain tooltip position
        const constrainedPos = constrainTooltip(
          tooltipWidth,
          tooltipHeight,
          pos.x,
          pos.y,
          containerWidth,
          containerHeight
        );

        tooltip
          .style('left', `${constrainedPos.left}px`)
          .style('top', `${constrainedPos.top}px`);
      })
      .on('mouseleave touchend touchcancel', function () {
        d3.select(this)
          .attr('r', 4)
          .attr('fill', (d) => {
            if (d.trend === 'up') return 'green';
            if (d.trend === 'down') return 'red';
            return '#1e88e5'; // Neutral color for first data point
          });
        tooltip
          .transition()
          .duration(500)
          .style('opacity', 0)
          .style('display', 'none');
      });

    // Add X-axis
    svg
      .append('g')
      .attr('class', 'x-axis axis')
      .attr('transform', `translate(0,${containerHeight - margin.bottom})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat(d3.timeFormat(config.dateFormat))
          .ticks(xTicks)
      )
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('font-size', '12px');

    // Add Y-axis
    svg
      .append('g')
      .attr('class', 'y-axis axis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6))
      .selectAll('text')
      .style('font-size', '12px');

    // Add X-axis label
    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr(
        'transform',
        `translate(${containerWidth / 2}, ${
          containerHeight - margin.bottom + 60
        })`
      )
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Date');

    // Add Y-axis label
    svg
      .append('text')
      .attr('class', 'axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', margin.left - 50)
      .attr('x', -containerHeight / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Stock Value');
  };

  // This useEffect ensures the chart is drawn whenever data or config changes
  useEffect(() => {
    if (data.length > 0) {
      drawChart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, config]);

  // Render logic based on data and error state
  if (error) {
    if (error.type === '404') {
      return <Funny404 onRetry={fetchData} />;
    } else if (error.type === 'timeout') {
      return <TimeoutMessage retryAfter={retryAfter} />;
    } else {
      return <UnexpectedError errorMessage={error.message} onRetry={fetchData} />;
    }
  }

  if (data.length === 0) {
    return <LoadingMessage />;
  }

  // Main chart rendering
  return (
    <div className="stock-chart">
      <div className="chart-container" ref={chartRef}></div>
      <Tooltip />
      <Legend />
      <DataTable data={data} updateData={updateData} />
    </div>
  );
}

StockChart.propTypes = {
  dataUrl: PropTypes.string,
};

export default StockChart;
