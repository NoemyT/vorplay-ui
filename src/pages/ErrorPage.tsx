import { Link } from "react-router-dom";

export default function ErrorPage() {
  return (
    <div className="flex flex-col gap-2">
      <h1>Page Not Found</h1>
      <Link to="/">Home</Link>
    </div>
  );
}
