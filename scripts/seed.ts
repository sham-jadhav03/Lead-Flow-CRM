import mongoose from "mongoose";
import { connectDB } from "../src/server/db";
import leadModel from "../src/server/models/Leads";
import discussionModel from "../src/server/models/Discussion";

const H = 3600_000;
const D = 24 * H;
const ago = (ms: number) => new Date(Date.now() - ms);
const at = (ms: number) => new Date(Date.now() + ms);
// Fixed local times so "today" and "overdue" are stable whenever the seed runs.
const today = (h: number) => {
  const d = new Date();
  d.setHours(h, 0, 0, 0);
  return d;
};
const yesterday = (h: number) => {
  const d = today(h);
  d.setDate(d.getDate() - 1);
  return d;
};

type LeadStatus =
  | "Contacted"
  | "Lost"
  | "New"
  | "Proposal Sent"
  | "Qualified"
  | "Won";

type Seed = {
  name: string;
  company: string;
  phone: string;
  status: LeadStatus;
  notes: { note: string; createdAt: Date; followUpAt?: Date }[]; // oldest first
};

const seeds: Seed[] = [
  {
    name: "Sarah Connor",
    company: "Acme Corp",
    phone: "555-0199",
    status: "Proposal Sent",
    notes: [
      { note: "Lead created via web form.", createdAt: ago(20 * D) },
      {
        note: "Initial discovery call. They need a CRM for 10 reps. Pain points: dropped leads, no follow-up tracking.",
        createdAt: ago(12 * D),
      },
      {
        note: "Sent pricing PDF. Said she would review with her boss.",
        createdAt: ago(2 * D),
        followUpAt: today(18),
      },
    ],
  },
  {
    name: "Hank Scorpio",
    company: "Globex",
    phone: "555-0142",
    status: "New",
    notes: [
      {
        note: "Inbound lead from website contact form.",
        createdAt: ago(3 * H),
      },
    ],
  },
  {
    name: "Bill Lumbergh",
    company: "Initech",
    phone: "555-0177",
    status: "Contacted",
    notes: [
      {
        note: "Left a voicemail with his assistant.",
        createdAt: ago(1 * D),
        followUpAt: yesterday(11),
      },
    ],
  },
  {
    name: "Bruce Wayne",
    company: "Wayne Enterprises",
    phone: "555-0100",
    status: "Won",
    notes: [
      { note: "Intro call, strong interest.", createdAt: ago(14 * D) },
      {
        note: "Contract signed. Sending welcome package.",
        createdAt: ago(5 * D),
      },
    ],
  },
  {
    name: "Diana Prince",
    company: "Themyscira Ltd",
    phone: "555-0123",
    status: "Qualified",
    notes: [
      { note: "Budget confirmed at $20k/yr.", createdAt: ago(4 * D) },
      {
        note: "Demo scheduled with her team.",
        createdAt: ago(1 * D),
        followUpAt: at(3 * D),
      },
    ],
  },
  {
    name: "Tony Stark",
    company: "Stark Industries",
    phone: "555-0188",
    status: "Lost",
    notes: [
      { note: "Chose an in-house build instead.", createdAt: ago(9 * D) },
    ],
  },
];

async function main() {
  await connectDB();
  await Promise.all([leadModel.deleteMany({}), discussionModel.deleteMany({})]);

  for (const s of seeds) {
    const last = s.notes[s.notes.length - 1];
    const followUps = s.notes.filter((n) => n.followUpAt);
    const lead = await leadModel.create({
      name: s.name,
      company: s.company,
      phone: s.phone,
      status: s.status,
      lastNote: last.note,
      lastDiscussionAt: last.createdAt,
      followUpAt: followUps.length
        ? followUps[followUps.length - 1].followUpAt
        : null,
    });
    await discussionModel.insertMany(
      s.notes.map((n) => ({ leadId: lead._id, ...n })),
    );
  }
  console.log(`Seeded ${seeds.length} leads`);
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
