# 10K Steps Wallpaper Generator

A web service that generates a beautiful spiral visualization of your yearly step count for iPhone lock screens.

## The Visualization

Your year spirals from the center outward:
- **Center**: January 1st (Day 1)
- **Outer edge**: December 31st (Day 365)
- **White dots**: Days you met your step goal
- **Red dots**: Days you missed your goal
- **Grey dots**: Future days
- **Number**: Today's day of the year
- **Stats**: Days left and hit percentage at the bottom

As the year progresses, your accomplishments radiate outward from the center, creating a beautiful circular pattern that fills in over time.

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/10k-steps)

Or manually:

```bash
npm i -g vercel
cd 10k-steps
vercel
```

## Local Development

```bash
cd 10k-steps
npm install
npm start
```

Server runs on `http://localhost:3000`

## API

### GET /wallpaper

Returns a PNG image.

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `width`   | Yes      | -       | Screen width in pixels |
| `height`  | Yes      | -       | Screen height in pixels |
| `data`    | Yes      | -       | Comma-separated step counts from Jan 1st |
| `goal`    | No       | 10000   | Daily step goal |

**Example:**
```
/wallpaper?width=1179&height=2556&data=12000,8500,11000,15000&goal=10000
```

## iOS Shortcut Setup

1. Create a new Shortcut
2. Add **"Get Contents of URL"** with your Vercel URL
3. Query parameters:
   - `width`: Use "Get Device Details" → Screen Width
   - `height`: Use "Get Device Details" → Screen Height
   - `data`: Get step counts from Health app (comma-separated)
   - `goal`: Your daily target (optional)
4. Add **"Set Wallpaper"** with the response

## Common iPhone Resolutions

| Device | Width | Height |
|--------|-------|--------|
| iPhone 15 Pro Max | 1290 | 2796 |
| iPhone 15 Pro | 1179 | 2556 |
| iPhone 15 | 1179 | 2556 |
| iPhone 14 | 1170 | 2532 |
| iPhone SE | 750 | 1334 |

## License

MIT
