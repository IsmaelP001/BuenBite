import { LoaderCircle } from "lucide-react";

export default function Loading() {
  return (
    <div>
      <LoaderCircle size={30} className="animate-spin" />
    </div>
  );
}
