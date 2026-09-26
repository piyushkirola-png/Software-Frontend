import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import AnnouncementBar from "../home/AnnouncementBar";
import TrustStrip from "../home/TrustStrip";

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <TrustStrip />
      <Footer />
    </div>
  );
}
