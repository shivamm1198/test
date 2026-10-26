/** Topics on the contact form. `?subject=<value>` on /contact preselects one. */
export const contactTopics = [
  { value: "membership", label: "Become a member" },
  { value: "internship", label: "Internships" },
  { value: "internship-listing", label: "List an internship" },
  { value: "scholarship", label: "Scholarships" },
  { value: "sponsor", label: "Sponsor a student" },
  { value: "chapter", label: "Start a state / campus chapter" },
  { value: "leadership", label: "Campus / Court Leadership" },
  { value: "donation", label: "Donations" },
  { value: "volunteer", label: "Volunteer with a wing" },
  { value: "media", label: "Media & partnerships" },
  { value: "general", label: "General enquiry" },
] as const;

export type ContactTopic = (typeof contactTopics)[number]["value"];

export const topicLabel = (value: string) =>
  contactTopics.find((t) => t.value === value)?.label ?? "General enquiry";
