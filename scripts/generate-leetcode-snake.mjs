import fs from "node:fs";
import path from "node:path";
import {
  cellsToGrid,
  getBestRoute,
  getPathToPose,
  snake4,
  init_svg_creator,
  exports_svg_creator
} from "./lib/snake.js";

// 1. Fetch LeetCode calendar
console.log("Fetching LeetCode submissionCalendar for siddhant_giri...");
const query = `query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    submissionCalendar
  }
}`;

const lcRes = await fetch("https://leetcode.com/graphql", {
  method: "POST",
  headers: { "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
  body: JSON.stringify({ query, variables: { username: "siddhant_giri" } })
});
const lcData = await lcRes.json();
const subCal = JSON.parse(lcData.data.matchedUser.submissionCalendar);
console.log("LeetCode unique submission days:", Object.keys(subCal).length);

// 2. Build 53 weeks (Sunday to Saturday) ending on today's week
const today = new Date();
today.setUTCHours(0, 0, 0, 0);

const dayOfWeek = today.getUTCDay(); // 0 is Sunday, 6 is Saturday
const endDay = new Date(today);
// Forward to Saturday to finish the current week
endDay.setUTCDate(today.getUTCDate() + (6 - dayOfWeek));

// 52 full weeks back from endDay (53 weeks total = 371 days)
const totalDays = 53 * 7;
const startDate = new Date(endDay.getTime() - (totalDays - 1) * 86400000);

const cells = [];
let weekIndex = 0;

for (let d = new Date(startDate); d <= endDay; d = new Date(d.getTime() + 86400000)) {
  const ts = Math.floor(d.getTime() / 1000);
  let count = 0;
  for (const [key, val] of Object.entries(subCal)) {
    if (Math.abs(Number(key) - ts) < 43200) {
      count = val;
      break;
    }
  }

  let level = 0;
  if (count >= 10) level = 4;
  else if (count >= 5) level = 3;
  else if (count >= 2) level = 2;
  else if (count >= 1) level = 1;

  const weekday = d.getUTCDay();
  cells.push({
    x: weekIndex,
    y: weekday,
    level,
    count,
    date: d.toISOString().split("T")[0]
  });

  if (weekday === 6) {
    weekIndex++;
  }
}

const totalSolved = cells.reduce((acc, c) => acc + c.count, 0);
console.log(`Generated ${cells.length} cells across ${weekIndex} weeks. Total submissions mapped: ${totalSolved}`);

// 3. Compute best snake route
console.log("Creating grid and calculating snake path...");
const grid = cellsToGrid(cells);
const chain = getBestRoute(grid, snake4);
chain.push(...getPathToPose(chain.slice(-1)[0], snake4));
console.log("Route calculated! Path steps:", chain.length);

// 4. Initialize SVG generator
init_svg_creator();
const { createSvg } = exports_svg_creator;

const animationOptions = {
  frameByStep: 1,
  stepDurationMs: 80
};

// Dark Mode SVG (LeetCode Theme: LeetCode Orange snake, AC Green contribution dots)
const darkDrawOptions = {
  sizeDotBorderRadius: 2,
  sizeCell: 16,
  sizeDot: 12,
  colorBackground: "#0d1117",
  colorDotBorder: "#1b1f230a",
  colorEmpty: "#161b22",
  colorDots: ["#161b22", "#01311f", "#034525", "#0f6d31", "#00c647"],
  colorSnake: "#ffa116"
};

// Light Mode SVG
const lightDrawOptions = {
  sizeDotBorderRadius: 2,
  sizeCell: 16,
  sizeDot: 12,
  colorBackground: "#ffffff",
  colorDotBorder: "#1b1f230a",
  colorEmpty: "#ebedf0",
  colorDots: ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"],
  colorSnake: "#ffa116"
};

fs.mkdirSync("dist", { recursive: true });

console.log("Rendering dark mode SVG...");
const darkSvg = createSvg(grid, cells, chain, darkDrawOptions, animationOptions);
fs.writeFileSync("dist/leetcode-snake-dark.svg", darkSvg);

console.log("Rendering light mode SVG...");
const lightSvg = createSvg(grid, cells, chain, lightDrawOptions, animationOptions);
fs.writeFileSync("dist/leetcode-snake.svg", lightSvg);

console.log("DONE! Saved to dist/leetcode-snake-dark.svg and dist/leetcode-snake.svg");