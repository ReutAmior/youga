// Exports the Youga Content Airtable base to data/content.json.
//
// Only sequences marked Vetted are exported. The app reads data/content.json;
// it never talks to Airtable directly, so no Airtable key ever reaches the browser.
//
// Run (Node 18 or newer):
//   AIRTABLE_TOKEN=pat_xxx node scripts/export-airtable.mjs
// The token needs the data.records:read scope on the Youga Content base.

import { writeFileSync, existsSync } from "node:fs";

const BASE_ID = "appNSNsHW04fBNxLc";
const TOKEN = process.env.AIRTABLE_TOKEN;
if (!TOKEN) {
  console.error("Set AIRTABLE_TOKEN first.");
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

const [poses, subs, subSteps, sequences, seqSteps] = await Promise.all(
  ["Poses", "Sub-sequences", "Sub-sequence steps", "Sequences", "Sequence steps"].map(readTable)
);

const subById = Object.fromEntries(subs.map((r) => [r.id, r]));
const usedPoses = new Set();

const exported = sequences
  .filter((s) => s.fields.Vetted)
  .map((s) => ({
    id: s.id,
    name: s.fields["Sequence name"],
    level: s.fields.Level,
    goal: s.fields.Goal,
    minutes: s.fields["Length (minutes)"],
    sections: seqSteps
      .filter((st) => (st.fields.Sequence || []).includes(s.id))
      .sort(byPosition)
      .map((st) => {
        const sub = subById[(st.fields["Sub-sequence"] || [])[0]];
        return {
          id: sub.id,
          name: sub.fields["Sub-sequence name"],
          editable: sub.fields.Editable === "Yes",
          transition: st.fields["Transition cue to next sub-sequence"] || null,
          steps: subSteps
            .filter((ps) => (ps.fields["Sub-sequence"] || []).includes(sub.id))
            .sort(byPosition)
            .map((ps) => {
              const pose = (ps.fields.Pose || [])[0];
              usedPoses.add(pose);
              return {
                pose,
                hold: ps.fields["Hold (breaths)"] || 1,
                breath: ps.fields.Breath || null,
                transition: ps.fields["Transition cue to next pose"] || null,
              };
            }),
        };
      }),
  }));

const poseMap = {};
for (const p of poses.filter((p) => usedPoses.has(p.id))) {
  const name = p.fields["Pose name"];
  const image = `images/poses/${slug(name)}.svg`;
  poseMap[p.id] = {
    name,
    sanskrit: p.fields["Sanskrit name"] || "",
    cueIn: p.fields["Cue into pose"] || "",
    cueOut: p.fields["Cue out of pose"] || "",
    image: existsSync(image) ? image : null,
  };
}

const out = {
  _note: "Generated from the Youga Content Airtable base. Do not edit by hand; edit Airtable and re-export (see docs/architecture.md).",
  exportedAt: new Date().toISOString().slice(0, 10),
  sequences: exported,
  poses: poseMap,
};
writeFileSync("data/content.json", JSON.stringify(out, null, 2) + "\n");
console.log(`Exported ${exported.length} sequence(s) and ${Object.keys(poseMap).length} pose(s).`);
