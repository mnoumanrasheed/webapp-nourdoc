import Link from "next/link";

export default function NotFound() {
  return <main className="notfound"><span className="eyebrow">NOURDOC / 404</span><h1>Page not available</h1><p>This page or sample clinical report could not be found.</p><Link href="/">Return to workspace</Link></main>;
}
