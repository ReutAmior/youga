// Exports the Youga Content Airtable base to data/content.json.
//
// Only sequences marked Vetted are exported. The app reads data/content.json;
// it never talks to Airtable directly, so no Airtable key ever reaches the browser.
//
// Content model (decisions 009 and 010):
// - A sub-sequence step links to a default Variation; the Pose (family) follows from it.
// - Every pose used is exported with all its variations, in Order, so the app can
//   step down a level or offer a swap. Alternative poses are exported too.
// - Text users see is exported as { en, he }. The Hebrew is included only when the
//   row's "Hebrew checked" box is ticked; otherwise "he" is null and the app shows English.
//
// Run (Node 20 or newer), with the token in .env.local (git ignores it):
//   node --env-file=.env.local scripts/export-airtable.mjs
// The token needs the data.records:read scope on the Youga Content base.

import { writeFileSync, existsSync } from "node:fs";

const BASE_ID = "appXMpKy4TpNPp86j";
const TOKEN = process.env.AIRTABLE_TOKEN;
if (!TOKEN) {
  console.error("Set AIRTABLE_TOKEN first (in .env.local).");
  process.exit(1);
}

async function readTable(table) {
  const rows = [];
  let offset;
  do {
    const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(table)}`);
    url.searchParams.set("pageSize", "100");
    if (offset) url.searchParams.set("offset", offset);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${TOKEN}` } });
    if (!res.ok) throw new Error(`${table}: ${res.status} ${await res.text()}`);
    const body = await res.json();
    rows.push(...body.records);
    offset = body.offset;
  } while (offset);
  return rows;
}

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const byPosition = (a, b) => (a.fields.Position ?? 0) - (b.fields.Position ?? 0);
const first = (links) => (links || [])[0] || null;

// { en, he } for a text field and its "(HE)" twin. Hebrew only once the row is checked.
function text(row, field) {
  const en = row.fields[field] || "";
  const he = row.fields["Hebrew checked"] ? row.fields[`${field} (HE)`] || null : null;
  return { en, he };
}
// Same, but null when there's no English text (e.g. no transition cue).
const optionalText = (row, field) => (row.fields[field] ? text(row, field) : null);

const [variations, poses, subs, subSteps, sequences, seqSteps] = await Promise.all(
  ["Variations", "Poses", "Sub-sequences", "Sub-sequence steps", "Sequences", "Sequence steps"].map(readTable)
);

const byId = (rows) => Object.fromEntries(rows.map((r) => [r.id, r]));
const subById = byId(subs);
const variationById = byId(variations);
const poseById = byId(poses);
const usedPoses = new Set();
const problems = [];

const exported = sequences
  .filter((s) => s.fields.Vetted)
  .map((s) => ({
    id: s.id,
    name: text(s, "Sequence name"),
    level: s.fields.Level,
    goal: s.fields.Goal,
    minutes: s.fields["Length (minutes)"],
    sections: seqSteps
      .filter((st) => (st.fields.Sequence || []).includes(s.id))
      .sort(byPosition)
      .map((st) => {
        const sub = subById[first(st.fields["Sub-sequence"])];
        return {
          id: sub.id,
          name: text(sub, "Sub-sequence name"),
          editable: sub.fields.Editable === "Yes",
          transition: optionalText(st, "Transition cue to next sub-sequence"),
          steps: subSteps
            .filter((ps) => (ps.fields["Sub-sequence"] || []).includes(sub.id))
            .sort(byPosition)
            .flatMap((ps) => {
              const variation = variationById[first(ps.fields["Default variation"])];
              const pose = variation && first(variation.fields.Pose);
              if (!variation || !pose) {
                problems.push(`${sub.fields["Sub-sequence name"]}, position ${ps.fields.Position}: no default variation or pose`);
                return [];
              }
              usedPoses.add(pose);
              return [{
                variation: variation.id,
                pose,
                hold: ps.fields["Hold (breaths)"] || 1,
                breath: ps.fields.Breath || null,
                transition: optionalText(ps, "Transition cue to next pose"),
              }];
            }),
        };
      }),
  }));

// Alternatives are exported too, so the app can fall back when no variation is safe.
for (const id of [...usedPoses]) {
  for (const alt of poseById[id]?.fields["Alternative poses"] || []) usedPoses.add(alt);
}

const poseMap = {};
const variationMap = {};
for (const id of usedPoses) {
  const p = poseById[id];
  const own = variations
    .filter((v) => first(v.fields.Pose) === id)
    .sort((a, b) => (a.fields.Order ?? 0) - (b.fields.Order ?? 0));
  poseMap[id] = {
    name: text(p, "Pose name"),
    sanskrit: p.fields["Sanskrit name"] || "",
    variations: own.map((v) => v.id),
    alternatives: p.fields["Alternative poses"] || [],
  };
  for (const v of own) {
    const image = `images/poses/${slug(v.fields["Variation name"])}.svg`;
    variationMap[v.id] = {
      pose: id,
      name: text(v, "Variation name"),
      level: v.fields.Level || null,
      order: v.fields.Order ?? null,
      props: v.fields.Props || [],
      fitsFlow: Boolean(v.fields["Fits the flow"]),
      contraindications: v.fields.Contraindications || [],
      cueIn: text(v, "Cue into pose"),
      cueOut: text(v, "Cue out of pose"),
      image: existsSync(image) ? image : null,
    };
  }
}

const out = {
  _note: "Generated from the Youga Content Airtable base. Do not edit by hand; edit Airtable and re-export (see docs/architecture.md).",
  exportedAt: new Date().toISOString().slice(0, 10),
  sequences: exported,
  poses: poseMap,
  variations: variationMap,
};
writeFileSync("data/content.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Exported ${exported.length} sequence(s), ${Object.keys(poseMap).length} pose(s) and ${Object.keys(variationMap).length} variation(s).`);
if (problems.length) console.warn(`Skipped ${problems.length} step(s):\n- ${problems.join("\n- ")}`);
