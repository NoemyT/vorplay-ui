import { useSearchParams } from "react-router-dom";

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import MainContent from "../components/MainContent";

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  //const navigate = useNavigate();

  const section = searchParams.get("section") || "default";

  const handleSectionChange = (newSection: string) => {
    setSearchParams({ section: newSection.toLowerCase() });
  };

  return (
    <>
      <Header />
      <div>
        <Sidebar onSelectSection={handleSectionChange} />
        <MainContent selectedSection={section} />
      </div>
    </>
  );
}
