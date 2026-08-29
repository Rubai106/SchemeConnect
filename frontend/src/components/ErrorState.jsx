export default function ErrorState({ message }) {
  return (
    <div className="rounded-md border border-clay/40 bg-red-50 px-4 py-3 text-sm text-clay">
      Couldn't load this data — {message}. Confirm the backend is running on{" "}
      <code className="font-mono">localhost:9141</code>.
    </div>
  );
}
