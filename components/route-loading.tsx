import { LoadingPanel } from "./ui";

export function RouteLoading({ label }: { label: string }) {
  return <main className="route-loading"><span className="eyebrow">NOURDOC WORKSPACE</span><h1>{label}</h1><LoadingPanel /></main>;
}
