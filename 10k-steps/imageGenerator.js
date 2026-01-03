const { createCanvas } = require('@napi-rs/canvas');

// Color constants
const COLORS = {
  BACKGROUND: '#000000',
  SUCCESS: '#ffffff',    // White - goal met
  FAILURE: '#ef4444',    // Red/orange - goal missed
  FUTURE: '#2a2a2c',     // Dark grey - future days
  TODAY_TEXT: '#ffffff', // White - today's number
  STATS_TEXT: '#6b6b6b', // Subtle grey for stats
};

const TOTAL_DAYS = 365;

/**
 * Generate rectangle with tapered bottom rows
 */
function generateTrapezoidPositions(width, height) {
  // Reserve space for iOS lock screen elements
  const topPaddingPercent = 0.32;
  const bottomPaddingPercent = 0.18;
  const sidePaddingPercent = 0.10;
  
  const topPadding = height * topPaddingPercent;
  const bottomPadding = height * bottomPaddingPercent;
  const sidePadding = width * sidePaddingPercent;
  
  const availableHeight = height - topPadding - bottomPadding;
  const availableWidth = width - (sidePadding * 2);
  
  // Grid: 15 columns, 25 rows = 375 cells, we use 365
  const cols = 15;
  const totalRows = 25;
  const taperStartRow = 22; // Start tapering at row 22 (last 3 rows)
  
  const cellWidth = availableWidth / cols;
  const cellHeight = availableHeight / totalRows;
  const circleRadius = Math.min(cellWidth, cellHeight) * 0.42;
  
  const positions = [];
  let dayIndex = 0;
  
  for (let row = 0; row < totalRows && dayIndex < TOTAL_DAYS; row++) {
    let dotsInRow = cols;
    let rowStartX = sidePadding;

    if (row >= taperStartRow) {
      const taperProgress = (row - taperStartRow + 1) / (totalRows - taperStartRow);
      const reduction = Math.floor(taperProgress * 6);
      dotsInRow = cols - reduction;
      rowStartX = sidePadding + ((cols - dotsInRow) / 2) * cellWidth;
    }
    
    const rowY = topPadding + (row + 0.5) * cellHeight;
    
    for (let col = 0; col < dotsInRow && dayIndex < TOTAL_DAYS; col++) {
      positions.push({
        x: rowStartX + (col + 0.5) * cellWidth,
        y: rowY,
      });
      dayIndex++;
    }
  }
  
  return { positions, circleRadius };
}

/**
 * Generate the wallpaper image
 */
function generateWallpaper({ width, height, data, goal = 10000 }) {
  // Parse step data
  const stepCounts = data
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => !isNaN(n));
  
  const todayIndex = stepCounts.length - 1;
  
  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  // Fill background
  ctx.fillStyle = COLORS.BACKGROUND;
  ctx.fillRect(0, 0, width, height);
  
  // Generate trapezoid positions
  const { positions, circleRadius } = generateTrapezoidPositions(width, height);
  
  // Draw circles at each position
  for (let dayIndex = 0; dayIndex < positions.length && dayIndex < TOTAL_DAYS; dayIndex++) {
    const { x, y } = positions[dayIndex];
    
    let fillColor;
    const isToday = dayIndex === todayIndex;
    
    if (dayIndex < stepCounts.length) {
      fillColor = stepCounts[dayIndex] >= goal ? COLORS.SUCCESS : COLORS.FAILURE;
    } else {
      fillColor = COLORS.FUTURE;
    }
    
    if (isToday) {
      // Draw today as a white number
      ctx.fillStyle = COLORS.TODAY_TEXT;
      const dayNum = dayIndex + 1;
      const fontSize = dayNum >= 100 ? circleRadius * 1.7 : circleRadius * 1.9;
      ctx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dayNum.toString(), x, y);
    } else {
      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
  }
  
  // Calculate stats (exclude today)
  const daysCompleted = stepCounts.length;
  const daysLeft = TOTAL_DAYS - daysCompleted;
  const pastDays = stepCounts.slice(0, -1);
  const goalsHit = pastDays.filter(steps => steps >= goal).length;
  const percentage = pastDays.length > 0 ? Math.round((goalsHit / pastDays.length) * 100) : 0;
  
  // Draw stats at bottom center
  const statsY = height * 0.92;
  const statsFontSize = width * 0.028;
  ctx.font = `${statsFontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textBaseline = 'middle';
  
  const daysText = `${daysLeft}d left`;
  const separator = ` · `;
  const percentText = `${percentage}% hit`;
  
  const daysWidth = ctx.measureText(daysText).width;
  const sepWidth = ctx.measureText(separator).width;
  const percentWidth = ctx.measureText(percentText).width;
  const totalWidth = daysWidth + sepWidth + percentWidth;
  
  let xPos = (width - totalWidth) / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = COLORS.SUCCESS;
  ctx.fillText(daysText, xPos, statsY);
  xPos += daysWidth;
  ctx.fillText(separator, xPos, statsY);
  xPos += sepWidth;
  ctx.fillText(percentText, xPos, statsY);
  
  return canvas.toBuffer('image/png');
}

module.exports = {
  generateWallpaper,
  COLORS,
};
