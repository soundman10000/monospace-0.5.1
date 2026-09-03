import { clip } from "../lib/text.js";
import { hash, pick, uuidFrom } from "../lib/id.js";

const CODE_MAX = 255;
const TEXT_MAX = 255;

const LAYOUTS = ["1x1", "1x2", "2x1", "2x2", "2x3"];
const SLOT_COUNT = { "1x1": 1, "1x2": 2, "2x1": 2, "2x2": 4, "2x3": 6 };
const TITLE_STYLES = ["h2", "h3", "h4", "h5"];
const DOC_TITLES = [
  "Summary of Benefits",
  "Evidence of Coverage",
  "Plan Brochure",
  "Schedule of Benefits",
  "Coverage Rider",
];

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

const headingFor = (index) =>
  index === 0 ? "What's covered" : index === 2 ? "Limitations" : "More information";

export const buildCoveragePages = (plans, benefits = []) => {
  const benefitCodeById = new Map(benefits.map((row) => [row.id, row.code]));
  const titles = [];
  const markdowns = [];
  const documents = [];
  const cards = [];
  const cardBlocks = [];
  const documentContainers = [];
  const documentLinks = [];
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

  const addDocument = (seed, code, title, plan) => {
    const item = {
      id: uuidFrom(seed),
      code: slug(code),
      description: `**${title}** for **${plan.name}**.\n\nThis is sample document copy generated for hydration. Attach a file in Directus when a real PDF is available.`,
      document: null,
    };
    documents.push(item);
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

  const addGridItem = (layoutId, collection, itemId, sort, seed) => {
    layoutBlocks.push({
      id: uuidFrom(seed),
      layout_grid_container_id: layoutId,
      collection,
      item: itemId,
      sort,
    });
  };

  const addCardItem = (cardId, collection, itemId, sort, seed) => {
    cardBlocks.push({
      id: uuidFrom(seed),
      layout_card_container_id: cardId,
      collection,
      item: itemId,
      sort,
    });
  };

  const addCard = (plan, prefix, seed, index) => {
    const card = {
      id: uuidFrom(`${seed}:card`),
      code: slug(`${prefix}-card`),
    };
    cards.push(card);

    const title = addTitle(
      `${seed}:title`,
      `${prefix}-t`,
      headingFor(index),
      pick(TITLE_STYLES, `${seed}:style`)
    );
    addCardItem(card.id, "block_title", title.id, 1, `${seed}:ct`);

    const markdown = addMarkdown(
      `${seed}:md`,
      `${prefix}-md`,
      index % 2 === 0 ? coveredMarkdown(plan, seed) : limitsMarkdown(plan, seed)
    );
    addCardItem(card.id, "block_markdown", markdown.id, 2, `${seed}:cm`);

    if (hash(`${seed}:doc`) % 4 === 0) {
      const doc = addDocument(
        `${seed}:cd`,
        `${prefix}-card-doc`,
        pick(DOC_TITLES, `${seed}:dt`),
        plan
      );
      addCardItem(card.id, "block_document", doc.id, 3, `${seed}:cj`);
    }

    return card;
  };

  const addDocumentsContainer = (plan, prefix, seed) => {
    const container = {
      id: uuidFrom(`${seed}:docs`),
      code: slug(`${prefix}-docs`),
    };
    documentContainers.push(container);

    const count = 1 + (hash(`${seed}:n`) % 3);
    for (let index = 0; index < count; index += 1) {
      const title = DOC_TITLES[index % DOC_TITLES.length];
      const doc = addDocument(`${seed}:d${index}`, `${prefix}-d${index + 1}`, title, plan);
      documentLinks.push({
        id: uuidFrom(`${seed}:dj${index}`),
        layout_documents_container_id: container.id,
        block_document_id: doc.id,
        sort: index + 1,
      });
    }

    return container;
  };

  const addNestedGrid = (plan, prefix, seed) => {
    const nested = addLayout(`${seed}:nested-layout`, `${prefix}-nested`, "1x2");
    const left = addCard(plan, `${prefix}-nl`, `${seed}:nl`, 0);
    const right = addCard(plan, `${prefix}-nr`, `${seed}:nr`, 1);
    addGridItem(nested.id, "layout_card_container", left.id, 1, `${seed}:nj1`);
    addGridItem(nested.id, "layout_card_container", right.id, 2, `${seed}:nj2`);
    return nested;
  };

  const fillGrid = (plan, layoutKind, layoutId, prefix, seed) => {
    const count = SLOT_COUNT[layoutKind] ?? 1;
    const nestAt = count >= 4 && hash(`${seed}:nest`) % 2 === 0 ? count - 1 : -1;

    for (let index = 0; index < count; index += 1) {
      const sort = index + 1;
      const slotSeed = `${seed}:slot:${index}`;
      const slotPrefix = `${prefix}-s${sort}`;

      if (index === nestAt) {
        const nested = addNestedGrid(plan, slotPrefix, slotSeed);
        addGridItem(layoutId, "layout_grid_container", nested.id, sort, `${slotSeed}:j`);
        continue;
      }

      if (hash(`${slotSeed}:kind`) % 3 === 0) {
        const docs = addDocumentsContainer(plan, slotPrefix, slotSeed);
        addGridItem(layoutId, "layout_documents_container", docs.id, sort, `${slotSeed}:j`);
        continue;
      }

      const card = addCard(plan, slotPrefix, slotSeed, index);
      addGridItem(layoutId, "layout_card_container", card.id, sort, `${slotSeed}:j`);
    }
  };

  for (const plan of plans) {
    const seed = `coverage:${plan.id}`;
    const prefix = slug(`${benefitCodeById.get(plan.benefit) || "plan"}-${plan.code}`);
    const pageTitle = addTitle(
      `${seed}:page-title`,
      `${prefix}-cov-title`,
      `${plan.name} Coverage`,
      "h1"
    );
    const pageDescription = addMarkdown(
      `${seed}:page-desc`,
      `${prefix}-cov-desc`,
      overviewMarkdown(plan)
    );
    const layoutKind = pick(LAYOUTS, `${seed}:layout`);
    const layout = addLayout(`${seed}:layout`, `${prefix}-cov-layout`, layoutKind);
    fillGrid(plan, layoutKind, layout.id, `${prefix}-cov`, seed);
    pages.push({
      id: uuidFrom(`${seed}:page`),
      code: slug(`${prefix}-coverage`),
      plan: plan.id,
      title: pageTitle.id,
      description: pageDescription.id,
      layout: layout.id,
    });
  }

  const assertUniqueCodes = (items, label) => {
    const seen = new Map();
    for (const item of items) {
      const previous = seen.get(item.code);
      if (previous) {
        throw new Error(`${label} code "${item.code}" is duplicated`);
      }
      seen.set(item.code, item.id);
    }
  };

  assertUniqueCodes(titles, "block_title");
  assertUniqueCodes(markdowns, "block_markdown");
  assertUniqueCodes(documents, "block_document");
  assertUniqueCodes(cards, "layout_card_container");
  assertUniqueCodes(documentContainers, "layout_documents_container");
  assertUniqueCodes(layouts, "layout_grid_container");
  assertUniqueCodes(pages, "page_plan_info");

  return {
    titles,
    markdowns,
    documents,
    cards,
    cardBlocks,
    documentContainers,
    documentLinks,
    layouts,
    layoutBlocks,
    pages,
  };
};
