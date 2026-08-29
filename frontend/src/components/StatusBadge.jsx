// Renders a case/inspection/decision status as an official-looking "stamp".
const MAP = {
  Pending: "stamp-pending",
  Scheduled: "stamp-pending",
  Assigned: "stamp-pending",
  "Under review": "stamp-pending",
  Completed: "stamp-complete",
  Verified: "stamp-complete",
  Approved: "stamp-complete",
  Overdue: "stamp-overdue",
  Rejected: "stamp-overdue",
  High: "stamp-overdue",
  Medium: "stamp-pending",
  Escalated: "stamp-pending",
  Low: "stamp-neutral"
};

export default function StatusBadge({ value }) {
  const cls = MAP[value] || "stamp-neutral";
  return <span className={cls}>{value}</span>;
}
