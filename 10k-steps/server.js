const express = require('express');
const { generateWallpaper } = require('./imageGenerator');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * Main wallpaper generation endpoint
 * 
 * Query Parameters:
 * - width: Screen width in points (required)
 * - height: Screen height in points (required)
 * - data: Comma-separated step counts starting from Jan 1st (required)
 * - goal: Step goal threshold (optional, defaults to 10000)
 * - scale: Device pixel ratio (optional, defaults to 3 for Retina)
 * 
 * Example: /wallpaper?width=393&height=852&data=8500,12000,9500&goal=10000&scale=3
 */
app.get('/wallpaper', (req, res) => {
  try {
    const { width, height, data, goal, scale } = req.query;
    
    // Validate required parameters
    if (!width || !height || !data) {
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['width', 'height', 'data'],
        example: '/wallpaper?width=393&height=852&data=8500,12000,9500&goal=10000&scale=3'
      });
    }
    
    // Parse numeric values
    const scaleNum = scale ? parseFloat(scale) : 3; // Default 3x for modern iPhones
    const widthNum = Math.round(parseInt(width, 10) * scaleNum);
    const heightNum = Math.round(parseInt(height, 10) * scaleNum);
    const goalNum = goal ? parseInt(goal, 10) : 10000;
    
    if (isNaN(widthNum) || isNaN(heightNum)) {
      return res.status(400).json({
        error: 'Invalid width or height values',
        message: 'Width and height must be valid integers'
      });
    }
    
    if (widthNum <= 0 || heightNum <= 0) {
      return res.status(400).json({
        error: 'Invalid dimensions',
        message: 'Width and height must be positive integers'
      });
    }
    
    if (widthNum > 5000 || heightNum > 5000) {
      return res.status(400).json({
        error: 'Dimensions too large',
        message: 'Width and height must be 5000 pixels or less'
      });
    }
    
    // Generate the wallpaper
    const imageBuffer = generateWallpaper({
      width: widthNum,
      height: heightNum,
      data: data,
      goal: goalNum
    });
    
    // Set headers and send the image
    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.send(imageBuffer);
    
  } catch (error) {
    console.error('Error generating wallpaper:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate wallpaper'
    });
  }
});

// Also serve on root path for convenience
app.get('/', (req, res) => {
  // If query params are present, generate wallpaper
  if (req.query.width && req.query.height && req.query.data) {
    return app._router.handle(req, res, () => {});
  }
  
  // Otherwise show usage info
  res.json({
    service: '10K Steps Wallpaper Generator',
    version: '2.0.0',
    description: 'Generates a spiral visualization of your yearly step count',
    usage: {
      endpoint: '/wallpaper',
      method: 'GET',
      parameters: {
        width: 'Screen width in points (required)',
        height: 'Screen height in points (required)',
        data: 'Comma-separated step counts starting from Jan 1st (required)',
        goal: 'Step goal threshold (optional, defaults to 10000)',
        scale: 'Device pixel ratio (optional, defaults to 3 for Retina displays)'
      },
      example: '/wallpaper?width=393&height=852&data=8500,12000,9500&goal=10000&scale=3',
      note: 'Width/height are multiplied by scale to get actual pixel dimensions'
    },
    visualization: {
      layout: 'Spiral from center outward',
      day1: 'Center of spiral',
      day365: 'Outer edge of spiral'
    },
    legend: {
      white: 'Days where step goal was met',
      red: 'Days where step goal was missed',
      white_number: 'Current day (today)',
      dark_grey: 'Future days'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server only if not imported as module (for Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`10K Steps Wallpaper Generator running on http://localhost:${PORT}`);
    console.log(`Example: http://localhost:${PORT}/wallpaper?width=1179&height=2556&data=8500,12000,9500&goal=10000`);
  });
}

// Export for Vercel
module.exports = app;

