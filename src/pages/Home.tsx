import AnnouncementBar from "../components/home/AnnouncementBar";
import Header from "../components/layout/Header";
import HeroSection from "../components/home/HeroSection";
import FeaturedDeals from "../components/home/FeaturedDeals";
import CategoryGrid from "../components/home/CategoryGrid";
import WhyChooseUs from "../components/home/WhyChooseUs";
import FaqSection from "../components/home/FaqSection";
import ReviewsCarousel from "../components/home/ReviewsCarousel";
import TrustStrip from "../components/home/TrustStrip";
import Footer from "../components/layout/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <FeaturedDeals />
        <CategoryGrid />
        <WhyChooseUs />
        <FaqSection />
        <ReviewsCarousel />
        <TrustStrip />
      </main>
      <Footer />
    </div>
  );
}
