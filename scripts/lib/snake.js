import { createRequire } from "node:module";
var __defProp = Object.defineProperty;
var __returnValue = (v) => v;
function __exportSetter(name, newValue) {
  this[name] = __returnValue.bind(null, newValue);
}
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {
      get: all[name],
      enumerable: true,
      configurable: true,
      set: __exportSetter.bind(all, name)
    });
};
var __esm = (fn, res) => () => (fn && (res = fn(fn = 0)), res);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// ../types/grid.ts
var isInside = (grid, x, y) => x >= 0 && y >= 0 && x < grid.width && y < grid.height, isInsideLarge = (grid, m, x, y) => x >= -m && y >= -m && x < grid.width + m && y < grid.height + m, copyGrid = ({ width, height, data }) => ({
  width,
  height,
  data: Uint8Array.from(data)
}), getIndex = (grid, x, y) => x * grid.height + y, getColor = (grid, x, y) => grid.data[getIndex(grid, x, y)], isEmpty = (color) => color === 0, setColor = (grid, x, y, color) => {
  grid.data[getIndex(grid, x, y)] = color || 0;
}, setColorEmpty = (grid, x, y) => {
  setColor(grid, x, y, 0);
}, createEmptyGrid = (width, height) => ({
  width,
  height,
  data: new Uint8Array(width * height)
});

// ../types/snake.ts
var getHeadX = (snake) => snake[0] - 2, getHeadY = (snake) => snake[1] - 2, getSnakeLength = (snake) => snake.length / 2, snakeEquals = (a, b) => {
  for (let i = 0;i < a.length; i++)
    if (a[i] !== b[i])
      return false;
  return true;
}, nextSnake = (snake, dx, dy) => {
  const copy = new Uint8Array(snake.length);
  for (let i = 2;i < snake.length; i++)
    copy[i] = snake[i - 2];
  copy[0] = snake[0] + dx;
  copy[1] = snake[1] + dy;
  return copy;
}, snakeWillSelfCollide = (snake, dx, dy) => {
  const nx = snake[0] + dx;
  const ny = snake[1] + dy;
  for (let i = 2;i < snake.length - 2; i += 2)
    if (snake[i + 0] === nx && snake[i + 1] === ny)
      return true;
  return false;
}, snakeToCells = (snake) => Array.from({ length: snake.length / 2 }, (_, i) => ({
  x: snake[i * 2 + 0] - 2,
  y: snake[i * 2 + 1] - 2
})), createSnakeFromCells = (points) => {
  const snake = new Uint8Array(points.length * 2);
  for (let i = points.length;i--; ) {
    snake[i * 2 + 0] = points[i].x + 2;
    snake[i * 2 + 1] = points[i].y + 2;
  }
  return snake;
};

// ../svg-creator/xml-utils.ts
var h = (element, attributes) => `<${element} ${toAttribute(attributes)}/>`, toAttribute = (o) => Object.entries(o).filter(([, value]) => value !== null).map(([name, value]) => `${name}="${value}"`).join(" ");

// ../svg-creator/css-utils.ts
var percent = (x) => parseFloat((x * 100).toFixed(2)).toString() + "%", mergeKeyFrames = (keyframes) => {
  const s = new Map;
  for (const { t, style } of keyframes) {
    s.set(style, [...s.get(style) ?? [], t]);
  }
  return Array.from(s.entries()).map(([style, ts]) => ({ style, ts })).sort((a, b) => a.ts[0] - b.ts[0]);
}, createAnimation = (name, keyframes) => `@keyframes ${name}{` + mergeKeyFrames(keyframes).map(({ style, ts }) => ts.map(percent).join(",") + `{${style}}`).join("") + "}", minifyCss = (css) => css.replace(/\s+/g, " ").replace(/.\s+[,;:{}()]/g, (a) => a.replace(/\s+/g, "")).replace(/[,;:{}()]\s+./g, (a) => a.replace(/\s+/g, "")).replace(/.\s+[,;:{}()]/g, (a) => a.replace(/\s+/g, "")).replace(/[,;:{}()]\s+./g, (a) => a.replace(/\s+/g, "")).replace(/\;\s*\}/g, "}").trim();

// ../svg-creator/snake.ts
var lerp = (k, a, b) => (1 - k) * a + k * b, createSnake = (chain, { sizeCell, sizeDot }, duration) => {
  const snakeN = chain[0] ? getSnakeLength(chain[0]) : 0;
  const snakeParts = Array.from({ length: snakeN }, () => []);
  for (const snake of chain) {
    const cells = snakeToCells(snake);
    for (let i = cells.length;i--; )
      snakeParts[i].push(cells[i]);
  }
  const svgElements = snakeParts.map((_, i, { length }) => {
    const dMin = sizeDot * 0.8;
    const dMax = sizeCell * 0.9;
    const iMax = Math.min(4, length);
    const u = (1 - Math.min(i, iMax) / iMax) ** 2;
    const s = lerp(u, dMin, dMax);
    const m = (sizeCell - s) / 2;
    const r = Math.min(4.5, 4 * s / sizeDot);
    return h("rect", {
      class: `s s${i}`,
      x: m.toFixed(1),
      y: m.toFixed(1),
      width: s.toFixed(1),
      height: s.toFixed(1),
      rx: r.toFixed(1),
      ry: r.toFixed(1)
    });
  });
  const transform = ({ x, y }) => `transform:translate(${x * sizeCell}px,${y * sizeCell}px)`;
  const styles = [
    `.s{ 
      shape-rendering: geometricPrecision;
      fill: var(--cs);
      animation: none linear ${duration}ms infinite
    }`,
    ...snakeParts.map((positions, i) => {
      const id = `s${i}`;
      const animationName = id;
      const keyframes = removeInterpolatedPositions(positions.map((tr, i2, { length }) => ({ ...tr, t: i2 / length }))).map(({ t, ...p }) => ({ t, style: transform(p) }));
      return [
        createAnimation(animationName, keyframes),
        `.s.${id}{
          ${transform(positions[0])};
          animation-name: ${animationName}
        }`
      ];
    })
  ].flat();
  return { svgElements, styles };
}, removeInterpolatedPositions = (arr) => arr.filter((u, i, arr2) => {
  if (i - 1 < 0 || i + 1 >= arr2.length)
    return true;
  const a = arr2[i - 1];
  const b = arr2[i + 1];
  const ex = (a.x + b.x) / 2;
  const ey = (a.y + b.y) / 2;
  return !(Math.abs(ex - u.x) < 0.01 && Math.abs(ey - u.y) < 0.01);
});
var init_snake = () => {};

// ../svg-creator/grid.ts
var createGrid = (cells, { sizeDotBorderRadius, sizeDot, sizeCell }, duration) => {
  const svgElements = [];
  const styles = [
    `.c{
      shape-rendering: geometricPrecision;
      fill: var(--ce);
      stroke-width: 1px;
      stroke: var(--cb);
      animation: none ${duration}ms linear infinite;
      width: ${sizeDot}px;
      height: ${sizeDot}px;
    }`
  ];
  let i = 0;
  for (const { x, y, color, t } of cells) {
    const id = t && "c" + (i++).toString(36);
    const m = (sizeCell - sizeDot) / 2;
    if (t !== null && id) {
      const animationName = id;
      styles.push(createAnimation(animationName, [
        { t: t - 0.0001, style: `fill:var(--c${color})` },
        { t: t + 0.0001, style: `fill:var(--ce)` },
        { t: 1, style: `fill:var(--ce)` }
      ]), `.c.${id}{
          fill: var(--c${color});
          animation-name: ${animationName}
        }`);
    }
    svgElements.push(h("rect", {
      class: ["c", id].filter(Boolean).join(" "),
      x: x * sizeCell + m,
      y: y * sizeCell + m,
      rx: sizeDotBorderRadius,
      ry: sizeDotBorderRadius
    }));
  }
  return { svgElements, styles };
};
var init_grid = () => {};

// ../svg-creator/stack.ts
var createStack = (cells, { sizeDot }, width, y, duration) => {
  const svgElements = [];
  const styles = [
    `.u{ 
      transform-origin: 0 0;
      transform: scale(0,1);
      animation: none linear ${duration}ms infinite;
    }`
  ];
  const stack = cells.slice().filter((a) => a.t !== null).sort((a, b) => a.t - b.t);
  const blocks = [];
  stack.forEach(({ color, t }) => {
    const latest = blocks[blocks.length - 1];
    if (latest?.color === color)
      latest.ts.push(t);
    else
      blocks.push({ color, ts: [t] });
  });
  const m = width / stack.length;
  let i = 0;
  let nx = 0;
  for (const { color, ts } of blocks) {
    const id = "u" + (i++).toString(36);
    const animationName = id;
    const x = (nx * m).toFixed(1);
    nx += ts.length;
    svgElements.push(h("rect", {
      class: `u ${id}`,
      height: sizeDot,
      width: (ts.length * m + 0.6).toFixed(1),
      x,
      y
    }));
    styles.push(createAnimation(animationName, [
      ...ts.map((t, i2, { length }) => [
        { scale: i2 / length, t: t - 0.0001 },
        { scale: (i2 + 1) / length, t: t + 0.0001 }
      ]).flat(),
      { scale: 1, t: 1 }
    ].map(({ scale, t }) => ({
      t,
      style: `transform:scale(${scale.toFixed(3)},1)`
    }))), `.u.${id} {
        fill: var(--c${color});
        animation-name: ${animationName};
        transform-origin: ${x}px 0
      }
      `);
  }
  return { svgElements, styles };
};
var init_stack = () => {};

// ../svg-creator/index.ts
var exports_svg_creator = {};
__export(exports_svg_creator, {
  createSvg: () => createSvg
});
var getCellsFromGrid = ({ width, height }) => Array.from({ length: width }, (_, x) => Array.from({ length: height }, (_2, y) => ({ x, y }))).flat(), createLivingCells = (grid0, chain, cells) => {
  const livingCells = (cells ?? getCellsFromGrid(grid0)).map(({ x, y }) => ({
    x,
    y,
    t: null,
    color: getColor(grid0, x, y)
  }));
  const grid = copyGrid(grid0);
  for (let i = 0;i < chain.length; i++) {
    const snake = chain[i];
    const x = getHeadX(snake);
    const y = getHeadY(snake);
    if (isInside(grid, x, y) && !isEmpty(getColor(grid, x, y))) {
      setColorEmpty(grid, x, y);
      const cell = livingCells.find((c) => c.x === x && c.y === y);
      cell.t = i / chain.length;
    }
  }
  return livingCells;
}, createSvg = (grid, cells, chain, drawOptions, animationOptions) => {
  const width = (grid.width + 2) * drawOptions.sizeCell;
  const height = (grid.height + 5) * drawOptions.sizeCell;
  const duration = animationOptions.stepDurationMs * chain.length;
  const livingCells = createLivingCells(grid, chain, cells);
  const elements = [
    createGrid(livingCells, drawOptions, duration),
    createStack(livingCells, drawOptions, grid.width * drawOptions.sizeCell, (grid.height + 2) * drawOptions.sizeCell, duration),
    createSnake(chain, drawOptions, duration)
  ];
  const viewBox = [
    -drawOptions.sizeCell,
    -drawOptions.sizeCell * 2,
    width,
    height
  ].join(" ");
  const style = generateColorVar(drawOptions) + elements.map((e) => e.styles).flat().join(`
`);
  const svg = [
    h("svg", {
      viewBox,
      width,
      height,
      xmlns: "http://www.w3.org/2000/svg"
    }).replace("/>", ">"),
    "<desc>",
    "Generated with https://github.com/Platane/snk",
    "</desc>",
    "<style>",
    optimizeCss(style),
    "</style>",
    ...elements.map((e) => e.svgElements).flat(),
    "</svg>"
  ].join("");
  return optimizeSvg(svg);
}, optimizeCss = (css) => minifyCss(css), optimizeSvg = (svg) => svg, generateColorVar = (drawOptions) => `
    :root {
    --cb: ${drawOptions.colorDotBorder};
    --cs: ${drawOptions.colorSnake};
    --ce: ${drawOptions.colorEmpty};
    ${Object.entries(drawOptions.colorDots).map(([i, color]) => `--c${i}:${color};`).join("")}
    }
    ` + (drawOptions.dark ? `
    @media (prefers-color-scheme: dark) {
      :root {
        --cb: ${drawOptions.dark.colorDotBorder || drawOptions.colorDotBorder};
        --cs: ${drawOptions.dark.colorSnake || drawOptions.colorSnake};
        --ce: ${drawOptions.dark.colorEmpty};
        ${Object.entries(drawOptions.dark.colorDots).map(([i, color]) => `--c${i}:${color};`).join("")}
      }
    }
` : "");
var init_svg_creator = __esm(() => {
  init_snake();
  init_grid();
  init_stack();
});

// ../draw/pathRoundedRect.ts
var pathRoundedRect = (ctx, width, height, borderRadius) => {
  ctx.moveTo(borderRadius, 0);
  ctx.arcTo(width, 0, width, height, borderRadius);
  ctx.arcTo(width, height, 0, height, borderRadius);
  ctx.arcTo(0, height, 0, 0, borderRadius);
  ctx.arcTo(0, 0, width, 0, borderRadius);
};

// ../draw/drawGrid.ts
var drawGrid = (ctx, grid, cells, o) => {
  for (let x = grid.width;x--; )
    for (let y = grid.height;y--; ) {
      if (!cells || cells.some((c) => c.x === x && c.y === y)) {
        const c = getColor(grid, x, y);
        const color = !c ? o.colorEmpty : o.colorDots[c];
        ctx.save();
        ctx.translate(x * o.sizeCell + (o.sizeCell - o.sizeDot) / 2, y * o.sizeCell + (o.sizeCell - o.sizeDot) / 2);
        ctx.fillStyle = color;
        ctx.strokeStyle = o.colorDotBorder;
        ctx.lineWidth = 1;
        ctx.beginPath();
        pathRoundedRect(ctx, o.sizeDot, o.sizeDot, o.sizeDotBorderRadius);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
        ctx.restore();
      }
    }
};
var init_drawGrid = () => {};

// ../draw/drawSnake.ts
var lerp2 = (k, a, b) => (1 - k) * a + k * b, clamp = (x, a, b) => Math.max(a, Math.min(b, x)), drawSnakeLerp = (ctx, snake0, snake12, k, o) => {
  const m = 0.8;
  const n = snake0.length / 2;
  for (let i = 0;i < n; i++) {
    const u = (i + 1) * 0.6 * (o.sizeCell / 16);
    const a = (1 - m) * (i / Math.max(n - 1, 1));
    const ki = clamp((k - a) / m, 0, 1);
    const x = lerp2(ki, snake0[i * 2 + 0], snake12[i * 2 + 0]) - 2;
    const y = lerp2(ki, snake0[i * 2 + 1], snake12[i * 2 + 1]) - 2;
    ctx.save();
    ctx.fillStyle = o.colorSnake;
    ctx.translate(x * o.sizeCell + u, y * o.sizeCell + u);
    ctx.beginPath();
    pathRoundedRect(ctx, o.sizeCell - u * 2, o.sizeCell - u * 2, (o.sizeCell - u * 2) * 0.25);
    ctx.fill();
    ctx.restore();
  }
};
var init_drawSnake = () => {};

// ../draw/drawWorld.ts
var drawStack = (ctx, stack, max, width, o) => {
  ctx.save();
  const m = width / max;
  for (let i = 0;i < stack.length; i++) {
    ctx.fillStyle = o.colorDots[stack[i]];
    ctx.fillRect(i * m, 0, m + width * 0.005, 10);
  }
  ctx.restore();
}, drawLerpWorld = (ctx, grid, cells, snake0, snake12, stack, k, o) => {
  ctx.save();
  if (o.colorBackground) {
    ctx.fillStyle = o.colorBackground;
    ctx.fillRect(0, 0, 99999, 99999);
  }
  ctx.translate(1 * o.sizeCell, 2 * o.sizeCell);
  drawGrid(ctx, grid, cells, o);
  drawSnakeLerp(ctx, snake0, snake12, k, o);
  ctx.translate(0, (grid.height + 2) * o.sizeCell);
  const max = grid.data.reduce((sum, x) => sum + +!!x, stack.length);
  drawStack(ctx, stack, max, grid.width * o.sizeCell, o);
  ctx.restore();
}, getCanvasWorldSize = (grid, o) => {
  const width = o.sizeCell * (grid.width + 2);
  const height = o.sizeCell * (grid.height + 4) + 30;
  return { width, height };
};
var init_drawWorld = __esm(() => {
  init_drawGrid();
  init_drawSnake();
});

// ../solver/step.ts
var step = (grid, stack, snake) => {
  const x = getHeadX(snake);
  const y = getHeadY(snake);
  const color = getColor(grid, x, y);
  if (isInside(grid, x, y) && !isEmpty(color)) {
    stack.push(color);
    setColorEmpty(grid, x, y);
  }
};
var init_step = () => {};

// ../gif-creator/index.ts
var exports_gif_creator = {};
__export(exports_gif_creator, {
  withTmpDir: () => withTmpDir,
  createGif: () => createGif
});
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
var createGif = async (grid0, cells, chain, drawOptions, animationOptions) => withTmpDir(async (dir) => {
  const { createCanvas } = await import("canvas");
  const { default: gifsicle } = await import("gifsicle");
  const { default: GIFEncoder } = await import("gif-encoder-2");
  const { width, height } = getCanvasWorldSize(grid0, drawOptions);
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d", {
    alpha: true
  });
  const grid = copyGrid(grid0);
  const stack = [];
  const encoder = new GIFEncoder(width, height, "neuquant", true, chain.length * animationOptions.frameByStep);
  encoder.setRepeat(0);
  encoder.setDelay(animationOptions.stepDurationMs / animationOptions.frameByStep);
  encoder.start();
  for (let i = 0;i < chain.length; i += 1) {
    const snake0 = chain[i];
    const snake12 = chain[Math.min(chain.length - 1, i + 1)];
    step(grid, stack, snake0);
    for (let k = 0;k < animationOptions.frameByStep; k++) {
      ctx.clearRect(0, 0, width, height);
      drawLerpWorld(ctx, grid, cells, snake0, snake12, stack, k / animationOptions.frameByStep, drawOptions);
      encoder.addFrame(ctx);
    }
  }
  const outFileName = path.join(dir, "out.gif");
  const optimizedFileName = path.join(dir, "out.optimized.gif");
  const paletteFileName = path.join(dir, "palette.txt");
  {
    const colors = [
      drawOptions.colorBackground,
      drawOptions.colorEmpty,
      drawOptions.colorSnake,
      drawOptions.colorDotBorder,
      ...Object.values(drawOptions.colorDots)
    ].filter(Boolean);
    const canvas2 = createCanvas(colors.length, 1);
    const ctx2 = canvas2.getContext("2d");
    for (let i = colors.length;i--; ) {
      ctx2.fillStyle = colors[i];
      ctx2.fillRect(i, 0, 1, 1);
    }
    const imgData = ctx2.getImageData(0, 0, colors.length, 1);
    fs.writeFileSync(paletteFileName, Array.from({ length: colors.length }, (_, i) => [
      imgData.data[i * 4 + 0],
      imgData.data[i * 4 + 1],
      imgData.data[i * 4 + 2]
    ].join(" ")).join(`
`));
  }
  encoder.finish();
  fs.writeFileSync(outFileName, encoder.out.getData());
  execFileSync(gifsicle, [
    "--optimize=3",
    "--color-method=diversity",
    `--use-colormap=${paletteFileName}`,
    outFileName,
    ["--output", optimizedFileName]
  ].flat());
  return new Uint8Array(fs.readFileSync(optimizedFileName));
}), withTmpDir = async (handler) => {
  const dir = path.join(tmpdir(), Math.random().toString(16).slice(2));
  fs.mkdirSync(dir, { recursive: true });
  try {
    return await handler(dir);
  } finally {
    fs.rmdirSync(dir, { recursive: true });
  }
};
var init_gif_creator = __esm(() => {
  init_drawWorld();
  init_step();
});

// ../forgejo-user-contribution/index.ts
var getForgejoUserContribution = async (userName, o = {}) => {
  const baseUrl = o.baseUrl ?? "https://codeberg.org";
  const res = await fetch(`${baseUrl}/api/v1/users/${userName}/heatmap`, {
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok)
    throw new Error(await res.text().catch(() => res.statusText));
  const heatmapData = await res.json();
  const countsByDate = new Map;
  for (const { timestamp, contributions } of heatmapData) {
    const date = new Date(timestamp * 1000).toLocaleDateString("en-CA");
    countsByDate.set(date, (countsByDate.get(date) ?? 0) + contributions);
  }
  const max = Math.max(0, ...countsByDate.values());
  const levelForCount = (count) => count <= 0 || max === 0 ? 0 : count >= max ? 4 : Math.ceil(count / max * 3);
  const today = new Date;
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 365);
  start.setDate(start.getDate() - start.getDay());
  const cells = [];
  const cursor = new Date(start);
  let x = 0;
  while (cursor <= today) {
    const y = cursor.getDay();
    const date = cursor.toLocaleDateString("en-CA");
    const count = countsByDate.get(date) ?? 0;
    cells.push({ x, y, date, count, level: levelForCount(count) });
    cursor.setDate(cursor.getDate() + 1);
    if (y === 6)
      x++;
  }
  return cells;
};

// ../github-user-contribution/index.ts
var getGithubUserContribution = async (userName, o) => {
  const query = `
    query ($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                contributionLevel
                weekday
                date
              }
            }
          }
        }
      }
    }
  `;
  const variables = { login: userName };
  const apiUrl = o.baseUrl ? `${o.baseUrl}/api/graphql` : "https://api.github.com/graphql";
  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `bearer ${o.githubToken}`,
      "Content-Type": "application/json",
      "User-Agent": "me@platane.me"
    },
    method: "POST",
    body: JSON.stringify({ variables, query })
  });
  if (!res.ok)
    throw new Error(await res.text().catch(() => res.statusText));
  const { data, errors } = await res.json();
  if (errors?.[0])
    throw errors[0];
  return data.user.contributionsCollection.contributionCalendar.weeks.flatMap(({ contributionDays }, x) => contributionDays.map((d) => ({
    x,
    y: d.weekday,
    date: d.date,
    count: d.contributionCount,
    level: d.contributionLevel === "FOURTH_QUARTILE" && 4 || d.contributionLevel === "THIRD_QUARTILE" && 3 || d.contributionLevel === "SECOND_QUARTILE" && 2 || d.contributionLevel === "FIRST_QUARTILE" && 1 || 0
  })));
};

// ../gitlab-user-contribution/index.ts
var getGitlabUserContribution = async (userName, o = {}) => {
  const baseUrl = o.baseUrl ?? "https://gitlab.com";
  const res = await fetch(`${baseUrl}/users/${userName}/calendar.json`, {
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok)
    throw new Error(await res.text().catch(() => res.statusText));
  const countsByDate = await res.json();
  const max = Math.max(0, ...Object.values(countsByDate));
  const levelForCount = (count) => count <= 0 || max === 0 ? 0 : count >= max ? 4 : Math.ceil(count / max * 3);
  const today = new Date;
  today.setHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - 365);
  start.setDate(start.getDate() - start.getDay());
  const cells = [];
  const cursor = new Date(start);
  let x = 0;
  while (cursor <= today) {
    const y = cursor.getDay();
    const date = cursor.toLocaleDateString("en-CA");
    const count = countsByDate[date] ?? 0;
    cells.push({ x, y, date, count, level: levelForCount(count) });
    cursor.setDate(cursor.getDate() + 1);
    if (y === 6)
      x++;
  }
  return cells;
};
// ../types/point.ts
var around4 = [
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 },
  { x: 0, y: 1 }
];

// ../solver/outside.ts
var createOutside = (grid, color = 0) => {
  const outside = createEmptyGrid(grid.width, grid.height);
  for (let x = outside.width;x--; )
    for (let y = outside.height;y--; )
      setColor(outside, x, y, 1);
  fillOutside(outside, grid, color);
  return outside;
};
var fillOutside = (outside, grid, color = 0) => {
  let changed = true;
  while (changed) {
    changed = false;
    for (let x = outside.width;x--; )
      for (let y = outside.height;y--; )
        if (getColor(grid, x, y) <= color && !isOutside(outside, x, y) && around4.some((a) => isOutside(outside, x + a.x, y + a.y))) {
          changed = true;
          setColorEmpty(outside, x, y);
        }
  }
  return outside;
};
var isOutside = (outside, x, y) => !isInside(outside, x, y) || isEmpty(getColor(outside, x, y));
// ../solver/utils/sortPush.ts
var sortPush = (arr, x, sortFn) => {
  let a = 0;
  let b = arr.length;
  if (arr.length === 0 || sortFn(x, arr[a]) <= 0) {
    arr.unshift(x);
    return;
  }
  while (b - a > 1) {
    const e2 = Math.ceil((a + b) / 2);
    const s = sortFn(x, arr[e2]);
    if (s === 0)
      a = b = e2;
    else if (s > 0)
      a = e2;
    else
      b = e2;
  }
  const e = Math.ceil((a + b) / 2);
  arr.splice(e, 0, x);
};
// ../solver/tunnel.ts
var getTunnelPath = (snake0, tunnel) => {
  const chain = [];
  let snake = snake0;
  for (let i = 1;i < tunnel.length; i++) {
    const dx = tunnel[i].x - getHeadX(snake);
    const dy = tunnel[i].y - getHeadY(snake);
    snake = nextSnake(snake, dx, dy);
    chain.unshift(snake);
  }
  return chain;
};
var isEmptySafe = (grid, x, y) => !isInside(grid, x, y) || isEmpty(getColor(grid, x, y));
var trimTunnelStart = (grid, tunnel) => {
  while (tunnel.length) {
    const { x, y } = tunnel[0];
    if (isEmptySafe(grid, x, y))
      tunnel.shift();
    else
      break;
  }
};
var trimTunnelEnd = (grid, tunnel) => {
  while (tunnel.length) {
    const i = tunnel.length - 1;
    const { x, y } = tunnel[i];
    if (isEmptySafe(grid, x, y) || tunnel.findIndex((p) => p.x === x && p.y === y) < i)
      tunnel.pop();
    else
      break;
  }
};

// ../solver/getBestTunnel.ts
var getColorSafe = (grid, x, y) => isInside(grid, x, y) ? getColor(grid, x, y) : 0;
var setEmptySafe = (grid, x, y) => {
  if (isInside(grid, x, y))
    setColorEmpty(grid, x, y);
};
var unwrap = (m) => !m ? [] : [...unwrap(m.parent), { x: getHeadX(m.snake), y: getHeadY(m.snake) }];
var getSnakeEscapePath = (grid, outside, snake0, color) => {
  const openList = [{ snake: snake0, w: 0 }];
  const closeList = [];
  while (openList[0]) {
    const o = openList.shift();
    const x = getHeadX(o.snake);
    const y = getHeadY(o.snake);
    if (isOutside(outside, x, y))
      return unwrap(o);
    for (const a of around4) {
      const c = getColorSafe(grid, x + a.x, y + a.y);
      if (c <= color && !snakeWillSelfCollide(o.snake, a.x, a.y)) {
        const snake = nextSnake(o.snake, a.x, a.y);
        if (!closeList.some((s0) => snakeEquals(s0, snake))) {
          const w = o.w + 1 + +(c === color) * 1000;
          sortPush(openList, { snake, w, parent: o }, (a2, b) => a2.w - b.w);
          closeList.push(snake);
        }
      }
    }
  }
  return null;
};
var getBestTunnel = (grid, outside, x, y, color, snakeN) => {
  const c = { x, y };
  const snake0 = createSnakeFromCells(Array.from({ length: snakeN }, () => c));
  const one = getSnakeEscapePath(grid, outside, snake0, color);
  if (!one)
    return null;
  const snakeICells = one.slice(0, snakeN);
  while (snakeICells.length < snakeN)
    snakeICells.push(snakeICells[snakeICells.length - 1]);
  const snakeI = createSnakeFromCells(snakeICells);
  const gridI = copyGrid(grid);
  for (const { x: x2, y: y2 } of one)
    setEmptySafe(gridI, x2, y2);
  const two = getSnakeEscapePath(gridI, outside, snakeI, color);
  if (!two)
    return null;
  one.shift();
  one.reverse();
  one.push(...two);
  trimTunnelStart(grid, one);
  trimTunnelEnd(grid, one);
  return one;
};
// ../solver/getPathTo.ts
var getPathTo = (grid, snake0, x, y) => {
  const openList = [{ snake: snake0, w: 0 }];
  const closeList = [];
  while (openList.length) {
    const c = openList.shift();
    const cx = getHeadX(c.snake);
    const cy = getHeadY(c.snake);
    for (let i = 0;i < around4.length; i++) {
      const { x: dx, y: dy } = around4[i];
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx === x && ny === y) {
        const path = [nextSnake(c.snake, dx, dy)];
        let e = c;
        while (e.parent) {
          path.push(e.snake);
          e = e.parent;
        }
        return path;
      }
      if (isInsideLarge(grid, 2, nx, ny) && !snakeWillSelfCollide(c.snake, dx, dy) && (!isInside(grid, nx, ny) || isEmpty(getColor(grid, nx, ny)))) {
        const nsnake = nextSnake(c.snake, dx, dy);
        if (!closeList.some((s) => snakeEquals(nsnake, s))) {
          const w = c.w + 1;
          const h = Math.abs(nx - x) + Math.abs(ny - y);
          const f = w + h;
          const o = { snake: nsnake, parent: c, w, h, f };
          sortPush(openList, o, (a, b) => a.f - b.f);
          closeList.push(nsnake);
        }
      }
    }
  }
};

// ../solver/clearResidualColoredLayer.ts
var clearResidualColoredLayer = (grid, outside, snake0, color) => {
  const snakeN = getSnakeLength(snake0);
  const tunnels = getTunnellablePoints(grid, outside, snakeN, color);
  tunnels.sort((a, b) => b.priority - a.priority);
  const chain = [snake0];
  while (tunnels.length) {
    let t = getNextTunnel(tunnels, chain[0]);
    chain.unshift(...getPathTo(grid, chain[0], t[0].x, t[0].y));
    chain.unshift(...getTunnelPath(chain[0], t));
    for (const { x, y } of t)
      setEmptySafe2(grid, x, y);
    fillOutside(outside, grid);
    for (let i = tunnels.length;i--; )
      if (isEmpty(getColor(grid, tunnels[i].x, tunnels[i].y)))
        tunnels.splice(i, 1);
      else {
        const t2 = tunnels[i];
        const tunnel = getBestTunnel(grid, outside, t2.x, t2.y, color, snakeN);
        if (!tunnel)
          tunnels.splice(i, 1);
        else {
          t2.tunnel = tunnel;
          t2.priority = getPriority(grid, color, tunnel);
        }
      }
    tunnels.sort((a, b) => b.priority - a.priority);
  }
  chain.pop();
  return chain;
};
var getNextTunnel = (ts, snake) => {
  let minDistance = Infinity;
  let closestTunnel = null;
  const x = getHeadX(snake);
  const y = getHeadY(snake);
  const priority = ts[0].priority;
  for (let i = 0;ts[i] && ts[i].priority === priority; i++) {
    const t = ts[i].tunnel;
    const d = distanceSq(t[0].x, t[0].y, x, y);
    if (d < minDistance) {
      minDistance = d;
      closestTunnel = t;
    }
  }
  return closestTunnel;
};
var getTunnellablePoints = (grid, outside, snakeN, color) => {
  const points = [];
  for (let x = grid.width;x--; )
    for (let y = grid.height;y--; ) {
      const c = getColor(grid, x, y);
      if (!isEmpty(c) && c < color) {
        const tunnel = getBestTunnel(grid, outside, x, y, color, snakeN);
        if (tunnel) {
          const priority = getPriority(grid, color, tunnel);
          points.push({ x, y, priority, tunnel });
        }
      }
    }
  return points;
};
var getPriority = (grid, color, tunnel) => {
  let nColor = 0;
  let nLess = 0;
  for (let i = 0;i < tunnel.length; i++) {
    const { x, y } = tunnel[i];
    const c = getColorSafe2(grid, x, y);
    if (!isEmpty(c) && i === tunnel.findIndex((p) => p.x === x && p.y === y)) {
      if (c === color)
        nColor += 1;
      else
        nLess += color - c;
    }
  }
  if (nColor === 0)
    return 99999;
  return nLess / nColor;
};
var distanceSq = (ax, ay, bx, by) => (ax - bx) ** 2 + (ay - by) ** 2;
var getColorSafe2 = (grid, x, y) => isInside(grid, x, y) ? getColor(grid, x, y) : 0;
var setEmptySafe2 = (grid, x, y) => {
  if (isInside(grid, x, y))
    setColorEmpty(grid, x, y);
};
// ../solver/clearCleanColoredLayer.ts
var clearCleanColoredLayer = (grid, outside, snake0, color) => {
  const snakeN = getSnakeLength(snake0);
  const points = getTunnellablePoints2(grid, outside, snakeN, color);
  const chain = [snake0];
  while (points.length) {
    const path = getPathToNextPoint(grid, chain[0], color, points);
    path.pop();
    for (const snake of path)
      setEmptySafe3(grid, getHeadX(snake), getHeadY(snake));
    chain.unshift(...path);
  }
  fillOutside(outside, grid);
  chain.pop();
  return chain;
};
var unwrap2 = (m) => !m ? [] : [m.snake, ...unwrap2(m.parent)];
var getPathToNextPoint = (grid, snake0, color, points) => {
  const closeList = [];
  const openList = [{ snake: snake0 }];
  while (openList.length) {
    const o = openList.shift();
    const x = getHeadX(o.snake);
    const y = getHeadY(o.snake);
    const i = points.findIndex((p) => p.x === x && p.y === y);
    if (i >= 0) {
      points.splice(i, 1);
      return unwrap2(o);
    }
    for (const { x: dx, y: dy } of around4) {
      if (isInsideLarge(grid, 2, x + dx, y + dy) && !snakeWillSelfCollide(o.snake, dx, dy) && getColorSafe3(grid, x + dx, y + dy) <= color) {
        const snake = nextSnake(o.snake, dx, dy);
        if (!closeList.some((s0) => snakeEquals(s0, snake))) {
          closeList.push(snake);
          openList.push({ snake, parent: o });
        }
      }
    }
  }
};
var getTunnellablePoints2 = (grid, outside, snakeN, color) => {
  const points = [];
  for (let x = grid.width;x--; )
    for (let y = grid.height;y--; ) {
      const c = getColor(grid, x, y);
      if (!isEmpty(c) && c <= color && !points.some((p) => p.x === x && p.y === y)) {
        const tunnel = getBestTunnel(grid, outside, x, y, color, snakeN);
        if (tunnel) {
          for (const p of tunnel)
            if (!isEmptySafe2(grid, p.x, p.y))
              points.push(p);
        }
      }
    }
  return points;
};
var getColorSafe3 = (grid, x, y) => isInside(grid, x, y) ? getColor(grid, x, y) : 0;
var setEmptySafe3 = (grid, x, y) => {
  if (isInside(grid, x, y))
    setColorEmpty(grid, x, y);
};
var isEmptySafe2 = (grid, x, y) => !isInside(grid, x, y) && isEmpty(getColor(grid, x, y));

// ../solver/getBestRoute.ts
var getBestRoute = (grid0, snake0) => {
  const grid = copyGrid(grid0);
  const outside = createOutside(grid);
  const chain = [snake0];
  for (const color of extractColors(grid)) {
    if (color > 1)
      chain.unshift(...clearResidualColoredLayer(grid, outside, chain[0], color));
    chain.unshift(...clearCleanColoredLayer(grid, outside, chain[0], color));
  }
  return chain.reverse();
};
var extractColors = (grid) => {
  let maxColor = Math.max(...grid.data);
  return Array.from({ length: maxColor }, (_, i) => i + 1);
};
// ../solver/getPathToPose.ts
var isEmptySafe3 = (grid, x, y) => !isInside(grid, x, y) || isEmpty(getColor(grid, x, y));
var getPathToPose = (snake0, target, grid) => {
  if (snakeEquals(snake0, target))
    return [];
  const targetCells = snakeToCells(target).reverse();
  const snakeN = getSnakeLength(snake0);
  const box = {
    min: {
      x: Math.min(getHeadX(snake0), getHeadX(target)) - snakeN - 1,
      y: Math.min(getHeadY(snake0), getHeadY(target)) - snakeN - 1
    },
    max: {
      x: Math.max(getHeadX(snake0), getHeadX(target)) + snakeN + 1,
      y: Math.max(getHeadY(snake0), getHeadY(target)) + snakeN + 1
    }
  };
  const [t0, ...forbidden] = targetCells;
  forbidden.slice(0, 3);
  const openList = [{ snake: snake0, w: 0 }];
  const closeList = [];
  while (openList.length) {
    const o = openList.shift();
    const x = getHeadX(o.snake);
    const y = getHeadY(o.snake);
    if (x === t0.x && y === t0.y) {
      const path = [];
      let e = o;
      while (e) {
        path.push(e.snake);
        e = e.parent;
      }
      path.unshift(...getTunnelPath(path[0], targetCells));
      path.pop();
      path.reverse();
      return path;
    }
    for (let i = 0;i < around4.length; i++) {
      const { x: dx, y: dy } = around4[i];
      const nx = x + dx;
      const ny = y + dy;
      if (!snakeWillSelfCollide(o.snake, dx, dy) && (!grid || isEmptySafe3(grid, nx, ny)) && (grid ? isInsideLarge(grid, 2, nx, ny) : box.min.x <= nx && nx <= box.max.x && box.min.y <= ny && ny <= box.max.y) && !forbidden.some((p) => p.x === nx && p.y === ny)) {
        const snake = nextSnake(o.snake, dx, dy);
        if (!closeList.some((s) => snakeEquals(snake, s))) {
          const w = o.w + 1;
          const h = Math.abs(nx - x) + Math.abs(ny - y);
          const f = w + h;
          sortPush(openList, { f, w, snake, parent: o }, (a, b) => a.f - b.f);
          closeList.push(snake);
        }
      }
    }
  }
};

// ../types/__fixtures__/snake.ts
var create = (length) => createSnakeFromCells(Array.from({ length }, (_, i) => ({ x: i, y: -1 })));
var snake1 = create(1);
var snake3 = create(3);
var snake4 = create(4);
var snake5 = create(5);
var snake9 = create(9);

// cellsToGrid.ts
var cellsToGrid = (cells) => {
  const width = Math.max(0, ...cells.map((c) => c.x)) + 1;
  const height = Math.max(0, ...cells.map((c) => c.y)) + 1;
  const grid = createEmptyGrid(width, height);
  for (const c of cells) {
    if (c.level > 0)
      setColor(grid, c.x, c.y, c.level);
    else
      setColorEmpty(grid, c.x, c.y);
  }
  return grid;
};

// generateSnakeAnimation.ts
var getUserContribution = async (source) => {
  switch (source.platform) {
    case "github":
      return getGithubUserContribution(source.username, {
        githubToken: source.githubToken,
        baseUrl: source.baseUrl
      });
    case "gitlab":
      return getGitlabUserContribution(source.username, {
        baseUrl: source.baseUrl
      });
    case "forgejo":
      return getForgejoUserContribution(source.username, {
        baseUrl: source.baseUrl
      });
  }
};
var generateSnakeAnimation = async (source, outputs) => {
  console.log(`\uD83C\uDFA3 fetching user contribution from ${source.platform}`);
  const cells = await getUserContribution(source);
  const grid = cellsToGrid(cells);
  const snake = snake4;
  console.log("\uD83D\uDCE1 computing best route");
  const chain = getBestRoute(grid, snake);
  chain.push(...getPathToPose(chain.slice(-1)[0], snake));
  return Promise.all(outputs.map(async (out, i) => {
    if (!out)
      return;
    const { format, drawOptions, animationOptions } = out;
    switch (format) {
      case "svg": {
        console.log(`\uD83D\uDD8C creating svg (outputs[${i}])`);
        const { createSvg: createSvg2 } = await Promise.resolve().then(() => (init_svg_creator(), exports_svg_creator));
        return createSvg2(grid, cells, chain, drawOptions, animationOptions);
      }
      case "gif": {
        console.log(`\uD83D\uDCF9 creating gif (outputs[${i}])`);
        const { createGif: createGif2 } = await Promise.resolve().then(() => (init_gif_creator(), exports_gif_creator));
        return createGif2(grid, cells, chain, drawOptions, animationOptions);
      }
    }
  }));
};
export {
  getUserContribution,
  generateSnakeAnimation
};

export { cellsToGrid, getBestRoute, getPathToPose, snake4, init_svg_creator, exports_svg_creator };