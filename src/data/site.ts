/**
 * Default content for the Vidhi Ekta Sngh website.
 *
 * Live content is edited by the president in the /admin dashboards and stored
 * in Supabase. These values are used to pre-fill the homepage editor, as a
 * fallback for any section that hasn't been saved yet, and for the whole site
 * when Supabase isn't configured (e.g. local development).
 *
 * NOTE: Names, numbers, dates, and contact details below are SAMPLE content.
 */

import type {
  RegisteredMember, ArticleItem, EventItem, GalleryItem, SiteContent } from "@/lib/content/schema";

const site: SiteContent["site"] = {
  name: "Vidhi Ekta Sngh",
  short: "VES",
  logo: "",
  hindi: "विधि एकता संघ",
  tagline: "United for Law. Committed to Justice.",
  description:
    "Vidhi Ekta Sngh is a national community of legal professionals and law students — opening doors to internships, scholarships, mentorship and events across India.",
  founded: 2020,
  email: "contact@vidhiektaSngh.org",
  phone: "+91 98765 43210",
  address: "Chamber Block, Patiala House Courts, New Delhi — 110001",
  hours: "Mon – Sat, 10:00 AM – 6:00 PM IST",
  socials: {
    youtube: "https://www.youtube.com/@VidhiEktaSngh",
    linkedin: "https://www.linkedin.com/company/vidhi-ekta-Sngh",
    instagram: "https://www.instagram.com/vidhiektaSngh",
    x: "https://x.com/vidhiektaSngh",
  },
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/internships", label: "Internships" },
  { href: "/wings", label: "Wings" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

/** Pages under the "More" menu in the header. */
export const navMore = [
  { href: "/registered-members", label: "Registered Members", description: "Every VES member across India" },
  { href: "/journal", label: "Journal", description: "Articles and papers by law students" },
  { href: "/journey", label: "Journey", description: "Milestones since our founding" },
];

/** Joined members per state / UT, keyed by the map's location id. */
const stateMembers: SiteContent["stateMembers"] = {
  dl: { members: 214, cities: ["New Delhi", "Dwarka", "Rohini"] },
  up: { members: 186, cities: ["Lucknow", "Prayagraj", "Noida", "Varanasi"] },
  mh: { members: 162, cities: ["Mumbai", "Pune", "Nagpur"] },
  rj: { members: 148, cities: ["Jaipur", "Jodhpur", "Udaipur"] },
  mp: { members: 112, cities: ["Bhopal", "Indore", "Jabalpur"] },
  ka: { members: 104, cities: ["Bengaluru", "Mysuru", "Dharwad"] },
  wb: { members: 92, cities: ["Kolkata", "Siliguri"] },
  gj: { members: 88, cities: ["Ahmedabad", "Gandhinagar", "Surat"] },
  tn: { members: 84, cities: ["Chennai", "Madurai", "Coimbatore"] },
  br: { members: 78, cities: ["Patna", "Gaya"] },
  hr: { members: 72, cities: ["Gurugram", "Chandigarh", "Rohtak"] },
  pb: { members: 66, cities: ["Ludhiana", "Amritsar", "Patiala"] },
  tg: { members: 62, cities: ["Hyderabad", "Warangal"] },
  kl: { members: 58, cities: ["Kochi", "Thiruvananthapuram"] },
  or: { members: 46, cities: ["Bhubaneswar", "Cuttack"] },
  ap: { members: 44, cities: ["Visakhapatnam", "Amaravati"] },
  jh: { members: 38, cities: ["Ranchi", "Jamshedpur"] },
  ut: { members: 34, cities: ["Dehradun", "Nainital"] },
  as: { members: 32, cities: ["Guwahati", "Dibrugarh"] },
  ct: { members: 28, cities: ["Raipur", "Bilaspur"] },
  hp: { members: 24, cities: ["Shimla", "Dharamshala"] },
  jk: { members: 22, cities: ["Jammu", "Srinagar", "Leh"] },
  ch: { members: 20, cities: ["Chandigarh"] },
  ga: { members: 14, cities: ["Panaji", "Margao"] },
  ml: { members: 10, cities: ["Shillong"] },
  mn: { members: 8, cities: ["Imphal"] },
  tr: { members: 7, cities: ["Agartala"] },
  sk: { members: 6, cities: ["Gangtok"] },
  py: { members: 5, cities: ["Puducherry"] },
  nl: { members: 5, cities: ["Kohima"] },
  mz: { members: 4, cities: ["Aizawl"] },
  ar: { members: 4, cities: ["Itanagar"] },
};

const links: SiteContent["links"] = {
  // Paste Google Form (or any form) links here or in the dashboard.
  joinFormUrl: "",
  scholarshipFormUrl: "",
};

const stats: SiteContent["stats"] = {
  internshipsFacilitated: 420,
  eventsHeld: 96,
};

const founder: SiteContent["founder"] = {
  name: "Adv. Rohan Malhotra",
  title: "Founder & National President",
  photo: "",
  quote:
    "The law is not a profession of the privileged few. Every student who walks into a courtroom for the first time deserves a mentor beside them — that is why Vidhi Ekta Sngh exists.",
  bio: [
    "An advocate practising before the High Court of Delhi with over a decade at the Bar, Adv. Malhotra founded VES in 2020 after witnessing how many talented law students from smaller towns never found their first internship.",
    "What began as a WhatsApp group of 40 students has grown into a national network spanning more than 30 states and union territories, with chapters, wings and a mentorship programme run entirely by volunteers.",
  ],
  credentials: [
    "Advocate, High Court of Delhi",
    "LL.M., Constitutional Law",
    "Pro bono counsel, District Legal Services Authority",
  ],
};

const pillars: SiteContent["pillars"] = [
  {
    key: "integrity",
    title: "Integrity",
    hindi: "निष्ठा",
    text: "We hold ourselves to the ethics of the Bar — honesty in counsel, transparency in action and fairness to every member.",
  },
  {
    key: "unity",
    title: "Unity",
    hindi: "एकता",
    text: "Students, advocates, academicians and judges — one fraternity, bound together across states, languages and backgrounds.",
  },
  {
    key: "justice",
    title: "Justice",
    hindi: "न्याय",
    text: "Access to justice is a constitutional promise. Our legal-aid camps and awareness drives carry it to every doorstep.",
  },
  {
    key: "empowerment",
    title: "Empowerment",
    hindi: "सशक्तिकरण",
    text: "Internships, scholarships and mentorship that turn ambition into opportunity — especially for first-generation lawyers.",
  },
];

const internships: SiteContent["internships"] = [
  {
    id: "lit-delhi-hc",
    title: "Litigation Intern — Constitutional & Writ Practice",
    organization: "Chambers of a Senior Advocate, High Court of Delhi",
    location: "New Delhi",
    mode: "On-site",
    domain: "Litigation",
    duration: "4 weeks",
    stipend: "₹5,000 / month",
    deadline: "31 Oct 2026",
    seats: 4,
    description:
      "Research on writ petitions, drafting of synopses and list of dates, and attending hearings before the Division Bench.",
    eligibility: "3rd year onwards (5-yr) / 2nd year onwards (3-yr LL.B.)",
    applyUrl: "",
  },
  {
    id: "corp-mumbai",
    title: "Corporate & M&A Intern",
    organization: "Tier-II Law Firm, Mumbai",
    location: "Mumbai",
    mode: "Hybrid",
    domain: "Corporate",
    duration: "6 weeks",
    stipend: "₹10,000 / month",
    deadline: "15 Nov 2026",
    seats: 3,
    description:
      "Due diligence reports, drafting of shareholder agreements and regulatory research under SEBI and Companies Act frameworks.",
    eligibility: "4th & 5th year students with a corporate law elective",
    applyUrl: "",
  },
  {
    id: "policy-remote",
    title: "Legal Policy & Research Fellow",
    organization: "VES Research & Publication Wing",
    location: "Pan-India",
    mode: "Remote",
    domain: "Policy & Research",
    duration: "8 weeks",
    stipend: "Certificate + publication credit",
    deadline: "20 Nov 2026",
    seats: 10,
    description:
      "Co-author policy briefs on criminal law reforms and the new BNS/BNSS/BSA codes for the VES Quarterly Law Review.",
    eligibility: "Any year; strong writing sample required",
    applyUrl: "",
  },
  {
    id: "legal-aid-jaipur",
    title: "Legal Aid Clinic Volunteer",
    organization: "District Legal Services Authority, Jaipur",
    location: "Jaipur",
    mode: "On-site",
    domain: "Legal Aid",
    duration: "3 weeks",
    stipend: "Travel allowance",
    deadline: "05 Nov 2026",
    seats: 12,
    description:
      "Assist panel lawyers at legal-aid camps, draft applications and conduct rights-awareness sessions in rural blocks.",
    eligibility: "All years; Hindi proficiency preferred",
    applyUrl: "",
  },
  {
    id: "judiciary-lucknow",
    title: "Judicial Research Intern",
    organization: "Under a District & Sessions Judge (Retd.), Lucknow",
    location: "Lucknow",
    mode: "On-site",
    domain: "Judiciary",
    duration: "4 weeks",
    stipend: "Unpaid · Certificate",
    deadline: "12 Nov 2026",
    seats: 2,
    description:
      "Case-law research, judgment summaries and exposure to trial-court procedure — ideal for judiciary aspirants.",
    eligibility: "Final-year students and recent graduates",
    applyUrl: "",
  },
  {
    id: "lit-bengaluru",
    title: "Civil & Commercial Litigation Intern",
    organization: "Advocate Chambers, High Court of Karnataka",
    location: "Bengaluru",
    mode: "On-site",
    domain: "Litigation",
    duration: "4 weeks",
    stipend: "₹4,000 / month",
    deadline: "25 Nov 2026",
    seats: 3,
    description:
      "Drafting plaints and written statements, commercial court filings and client conferences.",
    eligibility: "3rd year onwards",
    applyUrl: "",
  },
];

const internshipSteps: SiteContent["internshipSteps"] = [
  {
    title: "Register",
    text: "Create your VES membership profile with your CV and areas of interest.",
  },
  {
    title: "Apply",
    text: "Pick from verified openings across chambers, firms, NGOs and legal-aid bodies.",
  },
  {
    title: "Get matched",
    text: "Our Internship Wing shortlists and connects you with the mentor directly.",
  },
  {
    title: "Intern & grow",
    text: "Complete the internship with a VES certificate and a mentor's reference.",
  },
];

const internshipFaqs: SiteContent["internshipFaqs"] = [
  {
    q: "Is VES membership required to apply?",
    a: "Membership is free for law students. Registering helps us verify your enrolment and match you with mentors who fit your interests.",
  },
  {
    q: "Do you charge any placement fee?",
    a: "Never. VES does not charge students for internships, and we only list openings from verified advocates, firms and institutions.",
  },
  {
    q: "Can first-year students apply?",
    a: "Yes — many legal-aid, research and NGO internships are open to first-year students. Each listing mentions its eligibility.",
  },
  {
    q: "Will I receive a certificate?",
    a: "Every VES-facilitated internship includes a completion certificate. Outstanding interns may also receive a mentor's letter of recommendation.",
  },
];

const scholarships: SiteContent["scholarships"] = [
  {
    title: "VES Merit Scholarship",
    amount: "₹25,000",
    text: "For law students with outstanding academic records from economically weaker backgrounds.",
    deadline: "30 Nov 2026",
    applyUrl: "",
  },
  {
    title: "Nyaya Access Grant",
    amount: "₹15,000",
    text: "Covers travel and stay for students taking up internships outside their home city.",
    deadline: "Rolling",
    applyUrl: "",
  },
  {
    title: "Women in Law Fellowship",
    amount: "₹30,000",
    text: "Supports women law students pursuing litigation, with a year-long mentorship from senior advocates.",
    deadline: "15 Dec 2026",
    applyUrl: "",
  },
];

export const sampleEvents: EventItem[] = [
  {
    id: "sample-event-1",
    title: "National Moot Court Competition 2026",
    location: "New Delhi",
    startDate: "2026-08-14",
    endDate: "2026-08-16",
    dateLabel: "14 – 16 Aug 2026",
    description:
      "64 teams from 22 states argued a constitutional problem on digital privacy before benches of senior advocates and retired judges.",
    image: "/images/event-moot-court.svg",
    published: true,
  },
  {
    id: "sample-event-2",
    title: "Rural Legal Aid Camp",
    location: "Alwar, Rajasthan",
    startDate: "2026-07-02",
    endDate: null,
    dateLabel: "02 Jul 2026",
    description:
      "120 volunteers offered free consultations on land, pension and domestic-violence matters to over 900 villagers.",
    image: "/images/event-legal-aid.svg",
    published: true,
  },
  {
    id: "sample-event-3",
    title: "Constitution Day Seminar",
    location: "Lucknow",
    startDate: "2025-11-26",
    endDate: null,
    dateLabel: "26 Nov 2025",
    description:
      "A day-long reading and panel discussion on the Preamble, fundamental duties and 75 years of the Republic.",
    image: "/images/event-constitution-day.svg",
    published: true,
  },
  {
    id: "sample-event-4",
    title: "Legal Career Conclave",
    location: "Mumbai",
    startDate: "2026-01-18",
    endDate: null,
    dateLabel: "18 Jan 2026",
    description:
      "Partners, in-house counsel and judiciary toppers on building a career in law — beyond the usual paths.",
    image: "/images/event-career-conclave.svg",
    published: true,
  },
  {
    id: "sample-event-5",
    title: "Women & the Law Workshop",
    location: "Bengaluru",
    startDate: "2026-03-08",
    endDate: null,
    dateLabel: "08 Mar 2026",
    description:
      "Hands-on sessions on POSH compliance, maintenance law and courtroom confidence for young women advocates.",
    image: "/images/event-womens-rights.svg",
    published: true,
  },
  {
    id: "sample-event-6",
    title: "Legal Writing Bootcamp",
    location: "Online",
    startDate: "2026-05-22",
    endDate: "2026-05-24",
    dateLabel: "22 – 24 May 2026",
    description:
      "Three days on drafting, citation and persuasive writing, with personalised feedback on every submission.",
    image: "/images/event-legal-writing.svg",
    published: true,
  },
];

const news: SiteContent["news"] = [
  {
    date: "28 Sep 2026",
    category: "Announcement",
    title: "Applications open for the Winter Internship Cycle",
    text: "Over 60 openings across 14 cities — litigation, corporate, policy and legal aid. Applications close on 30 November.",
  },
  {
    date: "19 Sep 2026",
    category: "Chapters",
    title: "VES launches its Northeast Chapter in Guwahati",
    text: "The new chapter will coordinate legal-aid camps and internships across all eight northeastern states.",
  },
  {
    date: "02 Sep 2026",
    category: "Publication",
    title: "Quarterly Law Review — Issue 07 released",
    text: "This issue examines the first year of the new criminal codes, with contributions from 18 student authors.",
  },
  {
    date: "21 Aug 2026",
    category: "Recognition",
    title: "VES volunteers honoured by State Legal Services Authority",
    text: "Recognised for organising 40+ legal-awareness drives in rural Rajasthan over the past year.",
  },
  {
    date: "05 Aug 2026",
    category: "Partnership",
    title: "MoU signed with three National Law Universities",
    text: "The partnership opens joint research projects, guest lectures and shared moot-court infrastructure.",
  },
];

const memberSeed: [string, string, string][] = [
  ["Ananya Sharma", "National General Secretary", "Delhi"],
  ["Kabir Verma", "National Treasurer", "Uttar Pradesh"],
  ["Ishita Rao", "Head, Internship Wing", "Karnataka"],
  ["Arjun Nair", "Head, Legal Aid Wing", "Kerala"],
  ["Meera Joshi", "Head, Women's Rights Wing", "Maharashtra"],
  ["Siddharth Chauhan", "Head, Moot Court Wing", "Rajasthan"],
  ["Priya Iyer", "Head, Research Wing", "Tamil Nadu"],
  ["Aditya Banerjee", "Head, Media Wing", "West Bengal"],
  ["Riya Kapoor", "Head, Student Wing", "Punjab"],
  ["Vivaan Mishra", "Head, Events Wing", "Bihar"],
  ["Sneha Patel", "State Coordinator", "Gujarat"],
  ["Rahul Yadav", "State Coordinator", "Madhya Pradesh"],
  ["Aisha Khan", "State Coordinator", "Telangana"],
  ["Devansh Gupta", "State Coordinator", "Haryana"],
  ["Tanvi Deshmukh", "State Coordinator", "Maharashtra"],
  ["Harsh Vardhan", "State Coordinator", "Uttarakhand"],
  ["Nandini Reddy", "State Coordinator", "Andhra Pradesh"],
  ["Karan Sethi", "State Coordinator", "Delhi"],
  ["Pooja Mahapatra", "State Coordinator", "Odisha"],
  ["Rohit Sinha", "State Coordinator", "Jharkhand"],
  ["Simran Kaur", "State Coordinator", "Chandigarh"],
  ["Manav Thakur", "State Coordinator", "Himachal Pradesh"],
  ["Lavanya Menon", "State Coordinator", "Kerala"],
  ["Yash Agarwal", "State Coordinator", "Uttar Pradesh"],
  ["Diya Bora", "State Coordinator", "Assam"],
  ["Aman Tiwari", "State Coordinator", "Chhattisgarh"],
  ["Shreya Pandey", "Campus Ambassador Lead", "Uttar Pradesh"],
  ["Nikhil Saxena", "Mentorship Coordinator", "Rajasthan"],
  ["Zoya Qureshi", "Content & Outreach", "Jammu & Kashmir"],
  ["Pranav Kulkarni", "Technology Lead", "Karnataka"],
  ["Ira Fernandes", "Partnerships Lead", "Goa"],
  ["Abhinav Dubey", "Alumni Relations", "Madhya Pradesh"],
];

const members: SiteContent["members"] = memberSeed.map(([name, role, state]) => ({
  name,
  role,
  state,
  photo: "",
}));

const patrons: SiteContent["patrons"] = [
  {
    name: "Hon'ble Justice (Retd.) S. N. Kashyap",
    title: "Chief Patron",
    detail: "Former Judge, High Court of Judicature at Allahabad",
    photo: "",
  },
  {
    name: "Sr. Adv. Meenakshi Raghavan",
    title: "Patron",
    detail: "Senior Advocate, Supreme Court of India",
    photo: "",
  },
  {
    name: "Prof. (Dr.) Alok Bhattacharya",
    title: "Academic Patron",
    detail: "Former Vice-Chancellor, National Law University",
    photo: "",
  },
  {
    name: "Sr. Adv. Harpreet Gill",
    title: "Patron",
    detail: "Senior Advocate, Punjab & Haryana High Court",
    photo: "",
  },
];

const videos: SiteContent["videos"] = [
  {
    // Paste the YouTube video id (the part after "v=") to embed it inline.
    youtubeId: "",
    title: "National Moot Court 2026 — Final Round Highlights",
    duration: "12:48",
    image: "/images/event-moot-court.svg",
  },
  {
    youtubeId: "",
    title: "Know Your Rights: Free Legal Aid Explained",
    duration: "08:15",
    image: "/images/event-legal-aid.svg",
  },
  {
    youtubeId: "",
    title: "How to Land Your First Litigation Internship",
    duration: "15:02",
    image: "/images/event-career-conclave.svg",
  },
];

const wings: SiteContent["wings"] = [
  {
    key: "internship",
    icon: "briefcase",
    name: "Internship & Placement Wing",
    head: "Ishita Rao",
    summary:
      "Sources, verifies and matches internships with chambers, firms, NGOs and legal-aid bodies.",
    activities: ["Bi-annual internship cycles", "Mentor matching", "CV & interview clinics"],
    viewLabel: "View wing",
    viewUrl: "",
  },
  {
    key: "legal-aid",
    icon: "hand-heart",
    name: "Legal Aid Wing",
    head: "Arjun Nair",
    summary:
      "Takes free legal advice and rights awareness to villages, slums and under-served districts.",
    activities: ["Rural legal-aid camps", "Para-legal volunteer training", "DLSA partnerships"],
    viewLabel: "View wing",
    viewUrl: "",
  },
  {
    key: "moot",
    icon: "gavel",
    name: "Moot Court & Advocacy Wing",
    head: "Siddharth Chauhan",
    summary: "Builds courtroom skills through national moots, mock trials and advocacy workshops.",
    activities: [
      "National Moot Court Competition",
      "Mock trial series",
      "Oral advocacy masterclasses",
    ],
    viewLabel: "View wing",
    viewUrl: "",
  },
  {
    key: "research",
    icon: "book",
    name: "Research & Publication Wing",
    head: "Priya Iyer",
    summary: "Publishes the VES Quarterly Law Review and policy briefs on emerging areas of law.",
    activities: ["Quarterly Law Review", "Policy briefs", "Legal writing bootcamps"],
    viewLabel: "View wing",
    viewUrl: "",
  },
  {
    key: "women",
    icon: "venus",
    name: "Women's Rights Wing",
    head: "Meera Joshi",
    summary:
      "Champions women in law and works on awareness around gender justice and workplace safety.",
    activities: ["Women in Law Fellowship", "POSH awareness", "Helpline referrals"],
    viewLabel: "View wing",
    viewUrl: "",
  },
  {
    key: "student",
    icon: "graduation-cap",
    name: "Student Wing",
    head: "Riya Kapoor",
    summary: "The voice of law students — campus chapters, ambassadors and peer-learning circles.",
    activities: ["Campus chapters", "Ambassador programme", "Peer study circles"],
    viewLabel: "View wing",
    viewUrl: "",
  },
  {
    key: "events",
    icon: "calendar",
    name: "Events & Outreach Wing",
    head: "Vivaan Mishra",
    summary:
      "Plans seminars, conclaves and commemorations that bring the legal fraternity together.",
    activities: ["Constitution Day", "Career conclaves", "Guest lecture series"],
    viewLabel: "View wing",
    viewUrl: "",
  },
  {
    key: "media",
    icon: "megaphone",
    name: "Media & Communication Wing",
    head: "Aditya Banerjee",
    summary:
      "Tells the VES story through video, social media, newsletters and the YouTube channel.",
    activities: ["YouTube explainers", "Monthly newsletter", "Event coverage"],
    viewLabel: "View wing",
    viewUrl: "",
  },
];

const journey: SiteContent["journey"] = [
  {
    year: "2020",
    title: "A WhatsApp group becomes a movement",
    text: "Founded in New Delhi with 40 law students during the pandemic, VES began by sharing virtual internship openings and study material.",
  },
  {
    year: "2021",
    title: "First internship cycle",
    text: "The Internship Wing was formed and placed 60 students with advocates across five states — free of cost.",
  },
  {
    year: "2022",
    title: "Legal aid on the ground",
    text: "Our first rural legal-aid camp in Rajasthan reached 400 villagers. The Legal Aid Wing was formally constituted.",
  },
  {
    year: "2023",
    title: "Going national",
    text: "State coordinators appointed in 15 states. The VES Quarterly Law Review published its first issue.",
  },
  {
    year: "2024",
    title: "Scholarships launched",
    text: "The VES Merit Scholarship and Women in Law Fellowship were instituted with the support of our patrons.",
  },
  {
    year: "2025",
    title: "1,000 members strong",
    text: "Crossed 1,000 registered members and hosted the first National Moot Court Competition with 40 teams.",
  },
  {
    year: "2026",
    title: "30+ states and counting",
    text: "MoUs with National Law Universities, a Northeast chapter, and nearly 1,900 members across 32 states and UTs.",
  },
];

export const sampleGallery: GalleryItem[] = [
  {
    id: "sample-photo-1",
    src: "/images/gallery-01.svg",
    title: "Final round, National Moot Court",
    category: "Moot Court",
    w: 900,
    h: 1200,
  },
  {
    id: "sample-photo-2",
    src: "/images/gallery-02.svg",
    title: "Volunteers at the Alwar legal-aid camp",
    category: "Legal Aid",
    w: 1200,
    h: 800,
  },
  {
    id: "sample-photo-3",
    src: "/images/gallery-03.svg",
    title: "Keynote at the Career Conclave",
    category: "Seminars",
    w: 1000,
    h: 1000,
  },
  {
    id: "sample-photo-4",
    src: "/images/gallery-04.svg",
    title: "Felicitation of scholarship awardees",
    category: "Events",
    w: 900,
    h: 1200,
  },
  {
    id: "sample-photo-5",
    src: "/images/gallery-05.svg",
    title: "Library visit, Supreme Court of India",
    category: "Community",
    w: 1200,
    h: 800,
  },
  {
    id: "sample-photo-6",
    src: "/images/gallery-06.svg",
    title: "Legal writing bootcamp",
    category: "Seminars",
    w: 1000,
    h: 1000,
  },
  {
    id: "sample-photo-7",
    src: "/images/gallery-07.svg",
    title: "MoU signing with partner universities",
    category: "Events",
    w: 1200,
    h: 800,
  },
  {
    id: "sample-photo-8",
    src: "/images/gallery-08.svg",
    title: "Constitution Day reading circle",
    category: "Seminars",
    w: 900,
    h: 1200,
  },
  {
    id: "sample-photo-9",
    src: "/images/gallery-09.svg",
    title: "Best Speaker award ceremony",
    category: "Moot Court",
    w: 1000,
    h: 1000,
  },
  {
    id: "sample-photo-10",
    src: "/images/gallery-10.svg",
    title: "Rights awareness at a village school",
    category: "Legal Aid",
    w: 1200,
    h: 800,
  },
  {
    id: "sample-photo-11",
    src: "/images/gallery-11.svg",
    title: "Annual national meet",
    category: "Community",
    w: 900,
    h: 1200,
  },
  {
    id: "sample-photo-12",
    src: "/images/gallery-12.svg",
    title: "Women & the Law workshop",
    category: "Events",
    w: 1200,
    h: 800,
  },
];

const images: SiteContent["images"] = {
  aboutSection: "/images/ves-group-photo.png",
  aboutPage: "/images/VES-About.png",
  hero1: "/images/event-legal-aid.svg",
  hero2: "/images/gallery-07.svg",
  hero3: "/images/event-career-conclave.svg",
  hero4: "/images/gallery-12.svg",
  about1: "/images/gallery-02.svg",
  about2: "/images/gallery-10.svg",
  founder1: "/images/event-constitution-day.svg",
  founder2: "/images/gallery-05.svg",
};

const aboutSection: SiteContent["aboutSection"] = {
  eyebrow: "About VES",
  title: "One fraternity for every law student and legal professional",
  description:
    "Vidhi Ekta Sngh bridges the gap between the classroom and the courtroom. We connect students with the mentors, opportunities and community they need — wherever in India they study.",
  badgeText: "of building India's most welcoming legal community",
  points: [
    {
      icon: "briefcase",
      title: "Internships that open doors",
      text: "Verified placements with chambers, firms, courts and NGOs — never a fee.",
    },
    {
      icon: "graduation-cap",
      title: "Mentorship & scholarships",
      text: "Senior advocates guiding first-generation lawyers, backed by financial support.",
    },
    {
      icon: "hand-heart",
      title: "Law in service of people",
      text: "Legal-aid camps and awareness drives that take justice to the last mile.",
    },
  ],
  buttonLabel: "Read our story",
};

const aboutPage: SiteContent["aboutPage"] = {
  heroEyebrow: "About VES",
  heroTitle: "Law is a fraternity.",
  heroTitleMuted: "We make sure no one walks in alone.",
  heroDescription:
    "Vidhi Ekta Sngh (विधि एकता संघ) is a national, volunteer-led organisation that helps law students and young legal professionals find their footing — and gives back to society through legal aid.",
  purpose: [
    {
      icon: "target",
      title: "Our mission",
      text: "To make the legal profession accessible to every aspiring lawyer — through free internships, mentorship, scholarships and a community that shows up for each other.",
    },
    {
      icon: "eye",
      title: "Our vision",
      text: "A Bar that reflects all of India: where talent from every district and background has an equal shot at the courtroom, the boardroom and the Bench.",
    },
    {
      icon: "compass",
      title: "Our approach",
      text: "Volunteer-led and fee-free. Senior professionals give time, students give energy, and our wings turn both into programmes that last.",
    },
  ],
  storyEyebrow: "Our story",
  storyTitle: "From forty students to a national movement",
  storyParagraphs: [
    "In 2020, when courts went virtual and internships vanished overnight, a small group of law students and young advocates in Delhi started sharing whatever opportunities they could find. Within months, students from Jaipur, Patna, Kochi and Guwahati had joined in.",
    "That informal circle became Vidhi Ekta Sngh — vidhi (law), ekta (unity), Sngh (fraternity). Today our wings run internship cycles, scholarships, moot courts and legal-aid camps, with chapters in more than 30 states and union territories.",
    "We remain fee-free and volunteer-led, because the people who helped us find our first internship never asked for anything in return.",
  ],
  showStats: true,
  workEyebrow: "What we do",
  workTitle: "Six ways VES shows up for the legal community",
  work: [
    {
      title: "Internship facilitation",
      text: "Verified openings with chambers, firms, courts, NGOs and legal-services authorities.",
    },
    {
      title: "Mentorship circles",
      text: "Small groups of students guided by practising advocates for a full academic year.",
    },
    {
      title: "Scholarships & grants",
      text: "Financial support for merit, access and women in litigation.",
    },
    {
      title: "Legal-aid outreach",
      text: "Camps and awareness drives that take free legal advice to rural India.",
    },
    {
      title: "Moots & skill-building",
      text: "National moot courts, legal writing bootcamps and advocacy masterclasses.",
    },
    {
      title: "Research & publication",
      text: "The VES Quarterly Law Review and student-authored policy briefs.",
    },
  ],
};

const wingsPage: SiteContent["wingsPage"] = {
  heroEyebrow: "Organisation wings",
  heroTitle: "{count} wings. One fraternity.",
  heroDescription:
    "Each wing is led by a volunteer head and focuses on one part of our mission — together they carry VES from the courtroom to the countryside.",
  structureEyebrow: "How we're organised",
  structureTitle: "From the national executive to every campus",
  tiers: [
    {
      count: "Core body",
      tier: "National Executive",
      text: "Founder, patrons and office-bearers who set direction, uphold the pillars and steward funds.",
    },
    {
      count: "{wings} wings",
      tier: "Specialised Wings",
      text: "Run programmes nationally — internships, legal aid, moots, research, outreach and more.",
    },
    {
      count: "{states} states & UTs",
      tier: "State Chapters",
      text: "Led by state coordinators who adapt programmes to local courts, languages and needs.",
    },
    {
      count: "120+ campuses",
      tier: "Campus Chapters",
      text: "Student ambassadors who bring VES to their law schools and onboard new members.",
    },
  ],
};

const sectionText: SiteContent["sectionText"] = {
  founderEyebrow: "From the founder",
  founderLinkLabel: "Read the founder's message",

  pillarsEyebrow: "Four pillars of VES",
  pillarsTitle: "The principles we stand on",
  pillarsDescription:
    "Every programme, chapter and decision at Vidhi Ekta Sngh rests on four commitments.",

  membersEyebrow: "Our members",
  membersTitle: "People who carry VES forward",
  membersDescription:
    "Wing heads, state coordinators and volunteers — the national core team that makes every internship, camp and conclave happen.",

  patronsEyebrow: "Our patrons",
  patronsTitle: "Guided by the Bench, Bar and Academia",
  patronsDescription:
    "Eminent members of the legal fraternity who lend their wisdom and support to VES.",
  
  internshipsEyebrow: "Internships",
  internshipsTitle: "Your first step into the profession",
  internshipsDescription:
    "Verified internships with advocates, firms, courts and legal-aid bodies — matched to your interests and always free of placement fees.",

  scholarshipsEyebrow: "Scholarships",
  scholarshipsTitle: "Talent should never wait on means",
  scholarshipsDescription:
    "Funded by our patrons and members, VES scholarships support deserving law students with tuition, travel and year-long mentorship.",

  galleryEyebrow: "Gallery",
  galleryTitle: "Moments from the fraternity",
  galleryDescription:
    "Courtrooms, classrooms and village squares — a glimpse of VES in action.",

  eventsEyebrow: "Events",
  eventsTitle: "Where the legal community gathers",
  eventsDescription:
    "Moot courts, seminars, legal-aid camps and conclaves — organised by VES wings across the country.",

  newsEyebrow: "Inside VES",
  newsTitle: "News from the Sngh",
  newsDescription:
    "Announcements, chapter updates, publications and recognitions — straight from our wings.",

  youtubeEyebrow: "VES on YouTube",
  youtubeTitle: "Watch, learn and stay informed",
  youtubeDescription:
    "Event highlights, rights-awareness explainers and career guidance from practising lawyers.",

  journalEyebrow: "Student Journal",
  journalTitle: "Writing from the next generation of the Bar",
  journalDescription:
    "Articles, case comments and research papers by law students across India — read online or download the full paper.",

  registryEyebrow: "Registered members",
  registryTitle: "Our members across India",
  registryDescription:
    "Every law student and legal professional registered with VES, with their membership ID. Search by name, place or ID.",
  joinTitle: "Join India's fraternity of future lawyers",
  joinText:
    "Membership is free for law students. Get early access to internships, scholarships, mentorship circles and every VES event.",
  joinButtonLabel: "Become a member",
  joinSecondaryLabel: "Explore our wings",
};

const leadership: SiteContent["leadership"] = {
  eyebrow: "Lead with VES",
  title: "Represent VES where the law is practised and taught",
  description:
    "VES appoints leaders to run its work on a college campus or at a court. They guide interns, carry out initiatives directed by the national executive, and are VES's voice on the ground.",
  programmes: [
    {
      icon: "graduation-cap",
      title: "Campus Leadership",
      where: "At a law school or university campus",
      text: "Lead VES at your college: build the campus chapter, bring students into our internships and events, and carry out the programmes VES directs.",
      duties: [
        "Represent VES on your campus",
        "Manage and mentor interns from your college",
        "Run VES drives, workshops and legal-aid initiatives",
        "Report progress to the national executive",
      ],
      buttonLabel: "Apply for Campus Leadership",
      url: "",
    },
    {
      icon: "landmark",
      title: "Court Leadership",
      where: "At a District Court, a High Court or the Supreme Court",
      text: "Oversee VES's work at a court in your district, state or city — or at the Supreme Court — and be the link between the bar, our interns and VES.",
      duties: [
        "Oversee VES work at your court",
        "Supervise interns placed with advocates and chambers",
        "Implement initiatives directed by VES",
        "Build ties with the local bar and legal-aid bodies",
      ],
      buttonLabel: "Apply for Court Leadership",
      url: "",
    },
  ],
};

const latestUpdate: SiteContent["latestUpdate"] = {
  show: true,
  label: "Latest",
  text: "Applications open for the Winter Internship Cycle — 60+ openings across 14 cities",
  date: "28 Sep 2026",
  url: "/internships",
};

const donate: SiteContent["donate"] = {
  show: true,
  title: "Support our work",
  text: "Your donation funds legal-aid camps, scholarships for law students and free internships across India.",
  buttonLabel: "Donate now",
  url: "",
  upiId: "",
  details: "",
};

export const defaultContent: SiteContent = {
  site,
  links,
  stats,
  stateMembers,
  founder,
  pillars,
  internships,
  internshipSteps,
  internshipFaqs,
  scholarships,
  news,
  members,
  patrons,
  videos,
  wings,
  journey,
  images,
  aboutSection,
  aboutPage,
  wingsPage,
  sectionText,
  leadership,
  latestUpdate,
  donate,
};

/** Sample journal articles, shown only when Supabase isn't configured. */
export const sampleArticles: ArticleItem[] = [
  {
    id: "sample-article-1",
    slug: "right-to-privacy-in-the-age-of-facial-recognition",
    title: "The Right to Privacy in the Age of Facial Recognition",
    author: "Ananya Sharma",
    authorDetail: "4th year, B.A. LL.B. (Hons.)",
    category: "Constitutional Law",
    summary:
      "Eight years after Puttaswamy, facial recognition is spreading across Indian cities. This paper asks whether the proportionality test can keep pace.",
    body: "When the Supreme Court recognised privacy as a fundamental right, it set out a four-part proportionality test for any State intrusion: legality, legitimate aim, necessity and procedural safeguards.\n\nFacial recognition systems now deployed at railway stations and airports rarely rest on a specific statute. This paper maps those deployments against each limb of the test and finds the 'legality' requirement most often unmet.\n\nIt closes with three recommendations: a statutory basis for public-space biometrics, independent audits of accuracy across demographic groups, and a time-bound data retention rule.",
    cover: "",
    documentUrl: "",
    documentName: "",
    date: "2026-09-20",
    dateLabel: "20 Sep 2026",
    readingMinutes: 1,
    published: true,
  },
  {
    id: "sample-article-2",
    slug: "first-year-of-the-bharatiya-nyaya-sanhita",
    title: "One Year of the Bharatiya Nyaya Sanhita: What Changed in Trial Courts?",
    author: "Kabir Verma",
    authorDetail: "LL.M. candidate, Criminal Law",
    category: "Criminal Law",
    summary:
      "A look at how district courts have applied the new criminal code in its first year, drawn from 120 reported orders.",
    body: "The replacement of the Indian Penal Code was among the largest legislative changes to Indian criminal law since independence.\n\nThis case comment reviews 120 district-court orders to see where the new provisions on organised crime and community service have actually been invoked, and where courts continue to rely on IPC-era precedent.",
    cover: "",
    documentUrl: "",
    documentName: "",
    date: "2026-08-30",
    dateLabel: "30 Aug 2026",
    readingMinutes: 1,
    published: true,
  },
];

/** Sample registered members, shown only when Supabase isn't configured. */
export const sampleRegisteredMembers: RegisteredMember[] = [
  ["Aarav Sharma", "New Delhi"],
  ["Ananya Iyer", "Chennai, Tamil Nadu"],
  ["Kabir Mehta", "Mumbai, Maharashtra"],
  ["Fatima Siddiqui", "Lucknow, Uttar Pradesh"],
  ["Rohan Das", "Kolkata, West Bengal"],
  ["Ishita Rao", "Bengaluru, Karnataka"],
  ["Arjun Nair", "Kochi, Kerala"],
  ["Meera Joshi", "Pune, Maharashtra"],
  ["Vikram Singh", "Jaipur, Rajasthan"],
  ["Sana Khan", "Hyderabad, Telangana"],
  ["Aditya Kulkarni", "Nagpur, Maharashtra"],
  ["Priya Menon", "Thiruvananthapuram, Kerala"],
  ["Harsh Vardhan", "Patna, Bihar"],
  ["Nikita Agarwal", "Indore, Madhya Pradesh"],
  ["Devansh Gupta", "Prayagraj, Uttar Pradesh"],
  ["Tanvi Deshpande", "Aurangabad, Maharashtra"],
  ["Rahul Bora", "Guwahati, Assam"],
  ["Simran Kaur", "Chandigarh"],
  ["Yash Patel", "Ahmedabad, Gujarat"],
  ["Aisha Begum", "Srinagar, Jammu & Kashmir"],
  ["Karan Malhotra", "Gurugram, Haryana"],
  ["Pooja Mishra", "Bhopal, Madhya Pradesh"],
  ["Siddharth Rao", "Visakhapatnam, Andhra Pradesh"],
  ["Neha Chauhan", "Dehradun, Uttarakhand"],
  ["Om Prakash", ""],
  ["Lavanya Reddy", "Warangal, Telangana"],
  ["Manav Bhatt", "Shimla, Himachal Pradesh"],
  ["Riya Sen", "Bhubaneswar, Odisha"],
  ["Zoya Ahmed", "Ranchi, Jharkhand"],
  ["Gaurav Tiwari", "Varanasi, Uttar Pradesh"],
].map(([name, location], i) => {
  const code = `VES-${String(i + 1).padStart(4, "0")}`;
  return { id: code, code, name, location };
});
