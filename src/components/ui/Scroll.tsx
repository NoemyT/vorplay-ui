import { Outlet } from "react-router-dom";

export default function Scroll() {
  return (
    <div className="min-h-screen w-full overflow-y-auto md:overflow-y-hidden">
      <Outlet />
    </div>
  );
}
