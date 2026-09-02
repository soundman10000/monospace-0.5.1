import { clip } from "../lib/text.js";
import { hash, pick, uuidFrom } from "../lib/id.js";

const CODE_MAX = 255;
const TEXT_MAX = 255;

const LAYOUTS = ["1x1", "1x2", "2x1", "2x2", "2x3"];
const SLOT_COUNT = { "1x1": 1, "1x2": 2, "2x1": 2, "2x2": 4, "2x3": 6 };
const TITLE_STYLES = ["h1", "h2", "h3", "h4", "h5"];

const COVERED = [
  "Preventive care and routine visits",
  "Emergency and urgent care",
  "Inpatient hospital services",
  "Outpatient surgery",
  "Prescription drugs on the formulary",
  "Telehealth visits",
  "Laboratory tests and imaging",
  "Mental health and substance use treatment",
  "Rehabilitation and therapy services",
  "Durable medical equipment",
];

const LIMITS = [
  "Cosmetic procedures",
  "Services outside the network without prior authorization",
  "Experimental or investigational treatments",
  "Over-the-counter supplies",
  "Care that is not medically necessary",
  "Duplicate coverage already paid by another plan",
];

const slug = (value) =>
  clip(
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, ""),
    CODE_MAX
  );

const bullets = (items) => items.map((item) => `- ${item}`).join("\n");

const pickItems = (list, count, seed) => {
  const pool = [...list];
  const out = [];
  let h = hash(seed);
  while (out.length < count && pool.length > 0) {
    const index = h % pool.length;
    out.push(pool.splice(index, 1)[0]);
    h = (h * 31 + 17) >>> 0;
  }
  return out;
};

const coveredMarkdown = (plan, seed) =>
  `**${plan.name}** covers these services when they are medically necessary:\n\n${bullets(
    pickItems(COVERED, 4, `${seed}:covered`)
  )}`;

const limitsMarkdown = (plan, seed) =>
  `The following are not covered under **${plan.name}**:\n\n${bullets(
    pickItems(LIMITS, 3, `${seed}:limits`)
  )}`;

const overviewMarkdown = (plan) =>
  `${plan.name} (${plan.code}) is a sample coverage page generated for this plan.\n\nUse this page to review highlights, limits, and how benefits are arranged.`;

export const buildCoveragePages = (plans) => {
  const titles = [];
  const markdowns = [];
  const layouts = [];
  const layoutBlocks = [];
  const pages = [];

  const addTitle = (seed, code, text, style) => {
    const item = {
      id: uuidFrom(seed),
      code: slug(code),
      text: clip(text, TEXT_MAX),
      style,
    };
    titles.push(item);
    return item;
  };

  const addMarkdown = (seed, code, text) => {
    const item = {
      id: uuidFrom(seed),
      code: slug(code),
      text,
    };
    markdowns.push(item);
    return item;
  };

  const addLayout = (seed, code, layout) => {
    const item = {
      id: uuidFrom(seed),
      code: slug(code),
      layout,
    };
    layouts.push(item);
    return item;
  };

  const addBlock = (layoutId, collection, itemId, sort, seed) => {
    layoutBlocks.push({
      id: uuidFrom(seed),
      layout_grid_container_id: layoutId,
      collection,
      item: itemId,
      sort,
    });
  };

  const addNestedLayout = (plan, prefix, seed) => {
    const nested = addLayout(`${seed}:nested-layout`, `${prefix}-nested`, "1x2");
    const left = addMarkdown(
      `${seed}:nested-md-1`,
      `${prefix}-nested-md-1`,
      coveredMarkdown(plan, `${seed}:nested-left`)
    );
    const right = addMarkdown(
      `${seed}:nested-md-2`,
      `${prefix}-nested-md-2`,
      limitsMarkdown(plan, `${seed}:nested-right`)
    );
    addBlock(nested.id, "block_markdown", left.id, 1, `${seed}:nested-j1`);
    addBlock(nested.id, "block_markdown", right.id, 2, `${seed}:nested-j2`);
    return nested;
  };

  const fillSlots = (plan, layout, layoutId, prefix, seed) => {
    const count = SLOT_COUNT[layout] ?? 1;
    const nestAt = count >= 4 && hash(`${seed}:nest`) % 2 === 0 ? count - 1 : -1;

    for (let index = 0; index < count; index += 1) {
      const sort = index + 1;
      const slotSeed = `${seed}:slot:${index}`;
      if (index === nestAt) {
        const nested = addNestedLayout(plan, `${prefix}-s${sort}`, slotSeed);
        addBlock(layoutId, "layout_grid_container", nested.id, sort, `${slotSeed}:j`);
        continue;
      }
      if (index % 2 === 0) {
        const heading =
          index === 0 ? "What's covered" : index === 2 ? "Limitations" : "More information";
        const title = addTitle(
          `${slotSeed}:title`,
          `${prefix}-t${sort}`,
          heading,
          pick(TITLE_STYLES.slice(1), `${slotSeed}:style`)
        );
        addBlock(layoutId, "block_title", title.id, sort, `${slotSeed}:j`);
        continue;
      }
      const text =
        index === 1 ? coveredMarkdown(plan, slotSeed) : limitsMarkdown(plan, slotSeed);
      const markdown = addMarkdown(`${slotSeed}:md`, `${prefix}-md${sort}`, text);
      addBlock(layoutId, "block_markdown", markdown.id, sort, `${slotSeed}:j`);
    }
  };

  for (const plan of plans) {
    const seed = `coverage:${plan.id}`;
    const prefix = plan.code;
    const pageTitle = addTitle(`${seed}:page-title`, `${prefix}-cov-title`, `${plan.name} Coverage`, "h1");
    const pageDescription = addMarkdown(
      `${seed}:page-desc`,
      `${prefix}-cov-desc`,
      overviewMarkdown(plan)
    );
    const layoutKind = pick(LAYOUTS, `${seed}:layout`);
    const layout = addLayout(`${seed}:layout`, `${prefix}-cov-layout`, layoutKind);
    fillSlots(plan, layoutKind, layout.id, `${prefix}-cov`, seed);
    pages.push({
      id: uuidFrom(`${seed}:page`),
      code: slug(`${prefix}-coverage`),
      plan: plan.id,
      title: pageTitle.id,
      description: pageDescription.id,
      layout: layout.id,
    });
  }

  return { titles, markdowns, layouts, layoutBlocks, pages };
};


