import { useEffect, useLayoutEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components/macro';
import {
  Axis,
  buildChartTheme,
  LineSeries,
  Tooltip,
  XYChart,
} from '@visx/xychart';
// types
import type { ReactChildren, ReactChild } from 'react';
import type { XYChartTheme } from '@visx/xychart';

// NOTE: EPA's _reboot.css file causes the tooltip series glyph to be clipped
const VisxStyles = createGlobalStyle`
  .visx-tooltip-glyph svg {
    overflow: visible;
    width: 10px;
    height: 10px;
  }
`;

interface Datum {
  key: string;
  x: string;
  y: number;
}

const customTheme = buildChartTheme({
  backgroundColor: '#526571',
  colors: ['#2C2E43'],
  gridColor: '#30475e',
  gridColorDark: '#222831',
  svgLabelSmall: { fill: '#30475e' },
  svgLabelBig: { fill: '#ffffff' },
  tickLength: 4,
});

type Props = {
  children: ReactChild | ReactChildren;
  color?: string;
  containerRef?: HTMLElement | null;
  data: Datum[];
  dataKey: string;
  range?: number[];
  xAccessor?: (d: Datum) => string;
  yAccessor?: (d: Datum) => number;
  yUnit: string;
};

function LineChart({
  data,
  dataKey,
  range,
  color,
  containerRef,
  xAccessor = (d: Datum) => d.x,
  yAccessor = (d: Datum) => d.y,
  yUnit,
}: Props) {
  const [theme, setTheme] = useState<XYChartTheme>(customTheme);
  useEffect(() => {
    if (color) {
      const updatedTheme = {
        ...customTheme,
        colors: [color],
      };
      setTheme(updatedTheme);
    }
  }, [color]);

  const [width, setWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentBoxSize) {
          const contentBoxSize = Array.isArray(entry.contentBoxSize)
            ? entry.contentBoxSize[0]
            : entry.contentBoxSize;
          setWidth(contentBoxSize.inlineSize);
          break;
        }
      }
    });
    if (containerRef) {
      const elementStyle = window.getComputedStyle(containerRef, null);
      const contentWidth =
        containerRef?.getBoundingClientRect().width -
        parseFloat(elementStyle.getPropertyValue('padding-left')) -
        parseFloat(elementStyle.getPropertyValue('padding-right')) -
        parseFloat(elementStyle.getPropertyValue('border-left-width')) -
        parseFloat(elementStyle.getPropertyValue('border-right-width'));
      setWidth(contentWidth ?? null);
      resizeObserver.observe(containerRef);
    }

    return function cleanup() {
      if (containerRef) resizeObserver.unobserve(containerRef);
    };
  }, [containerRef]);

  return (
    <>
      <VisxStyles />
      <XYChart
        height={500}
        margin={{ top: 50, bottom: 25, left: 50, right: 25 }}
        theme={theme}
        xScale={{ type: 'band', paddingInner: 1, paddingOuter: 1 }}
        yScale={{ type: 'linear', domain: range, zero: false }}
      >
        <Axis
          numTicks={width ? Math.floor(width / 100) : 4}
          orientation="bottom"
        />
        <Axis orientation="left" />
        <LineSeries
          data={data}
          dataKey={dataKey}
          xAccessor={xAccessor}
          yAccessor={yAccessor}
        />
        <Tooltip<Datum>
          showDatumGlyph
          showVerticalCrosshair
          snapTooltipToDatumX
          renderTooltip={({ tooltipData }) => (
            <>
              {tooltipData?.nearestDatum &&
                xAccessor(tooltipData.nearestDatum.datum)}
              :{' '}
              {tooltipData?.nearestDatum &&
                yAccessor(tooltipData.nearestDatum.datum)}{' '}
              {yUnit}
            </>
          )}
        />
      </XYChart>
    </>
  );
}

export default LineChart;
