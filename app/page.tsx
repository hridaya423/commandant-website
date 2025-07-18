import Navigation from '@/components/ui/Navigation';
import Hero from '@/components/ui/Hero';
import CodeShowcase from '@/components/ui/CodeShowcase';
import Footer from '@/components/ui/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-charcoal-black">
      <Navigation />
      <Hero />
      <CodeShowcase />
      <Footer />
    </div>
  );
}
