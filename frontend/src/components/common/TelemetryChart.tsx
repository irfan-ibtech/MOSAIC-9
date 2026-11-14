import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';

interface TelemetryChartProps {
  options: Record<string, any>;
  height?: string | number;
  className?: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  options,
  height = 280,
  className = '',
}) => {
  // Merge aerospace dark theme defaults
  const mergedOptions = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'Inter, sans-serif',
        color: '#94a3b8',
      },
      grid: {
        top: 30,
        right: 20,
        bottom: 25,
        left: 45,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0c1322',
        borderColor: '#1e2c4c',
        borderWidth: 1,
        textStyle: {
          color: '#e2e8f0',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
        },
        padding: [8, 12],
      },
      ...options,
    };
  }, [options]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ReactECharts
        option={mergedOptions}
        style={{ height: height, width: '100%' }}
        opts={{ renderer: 'canvas' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
};
