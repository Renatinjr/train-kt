import { ImportView } from "@/components/ImportView";

export const metadata = { title: "Import" };

export default function ImportPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-[26px] font-extrabold tracking-tight">Import plan</h1>
      <ImportView />
    </div>
  );
}
