import { useEffect, useState } from "react";
import logo from "@/assets/logo-premium.png";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1700);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-background loading-fade-out">
      <div className="loading-logo brand-logo-frame brand-logo-frame--loading">
        <img src={logo} alt="Barbaros Barbershop" className="brand-logo-img brand-logo-img--loading" />
      </div>
    </div>
  );
}
