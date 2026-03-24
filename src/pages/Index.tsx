import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import ServicesSection from "@/components/ServicesSection";
import AboutSection from "@/components/AboutSection";
import GallerySection from "@/components/GallerySection";
import TestimonialsSection from "@/components/TestimonialsSection";
import BookingSection from "@/components/BookingSection";
import LocationSection from "@/components/LocationSection";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";
import LoadingScreen from "@/components/LoadingScreen";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Index() {
  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <ServicesSection />
        <AboutSection />
        <GallerySection />
        <TestimonialsSection />
        <BookingSection />
        <LocationSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
