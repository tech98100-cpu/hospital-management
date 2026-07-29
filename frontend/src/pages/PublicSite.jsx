import { useState, useEffect, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import FeatureStrip from "../components/FeatureStrip";
import DoctorsSection from "../components/DoctorsSection";
import DepartmentsSection from "../components/DepartmentsSection";
import BookingWidget from "../components/BookingWidget";
import Testimonials from "../components/Testimonials";
import EmergencyBanner from "../components/EmergencyBanner";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import MyAppointmentsModal from "../components/MyAppointmentsModal";
import { getDoctors, getDepartments, getStats } from "../api";
import { useAuth } from "../context/AuthContext";

export default function PublicSite() {
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState(null);
  const [authMode, setAuthMode] = useState(null); // null | 'login' | 'register'
  const [showAppointments, setShowAppointments] = useState(false);
  const [presetDoctor, setPresetDoctor] = useState(null);

  const bookingRef = useRef(null);
  const doctorsRef = useRef(null);
  const departmentsRef = useRef(null);
  const testimonialsRef = useRef(null);
  const heroRef = useRef(null);

  const loadAll = useCallback(async () => {
    try {
      const [d, dep, s] = await Promise.all([getDoctors(), getDepartments(), getStats()]);
      setDoctors(d);
      setDepartments(dep);
      setStats(s);
    } catch {
      // network hiccup — sections show their own empty states
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  function scrollTo(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleNavClick(section) {
    const map = { hero: heroRef, doctors: doctorsRef, booking: bookingRef, departments: departmentsRef, testimonials: testimonialsRef };
    scrollTo(map[section]);
  }

  function handleBookNow(doc) {
    setPresetDoctor(doc);
    scrollTo(bookingRef);
  }

  function handleDepartmentSelect(depName) {
    setPresetDoctor({ department: depName, _id: "" });
    scrollTo(bookingRef);
  }

  function handleAuthSuccess() {
    setAuthMode(null);
  }

  return (
    <div className="page">
      <Navbar
        patient={user}
        onLoginClick={() => setAuthMode("login")}
        onRegisterClick={() => setAuthMode("register")}
        onMyAppointmentsClick={() => setShowAppointments(true)}
        onLogout={logout}
        onNavClick={handleNavClick}
      />

      <div ref={heroRef}>
        <Hero stats={stats} onBookClick={() => scrollTo(bookingRef)} onExploreClick={() => scrollTo(doctorsRef)} />
      </div>

      <FeatureStrip stats={stats} />

      <div ref={doctorsRef}>
        <DoctorsSection doctors={doctors} onBookNow={handleBookNow} />
      </div>

      <div ref={departmentsRef}>
        <DepartmentsSection departments={departments} onSelect={handleDepartmentSelect} />
      </div>

      <div ref={bookingRef}>
        <BookingWidget
          departments={departments}
          doctors={doctors}
          presetDoctor={presetDoctor}
          patient={user}
          onRequireAuth={() => setAuthMode("login")}
          onBooked={loadAll}
        />
      </div>

      <div ref={testimonialsRef}>
        <Testimonials />
      </div>

      <EmergencyBanner />
      <Footer />

      {authMode && (
        <AuthModal
          mode={authMode}
          onClose={() => setAuthMode(null)}
          onSuccess={handleAuthSuccess}
          onSwitchMode={setAuthMode}
        />
      )}

      {showAppointments && <MyAppointmentsModal onClose={() => setShowAppointments(false)} />}
    </div>
  );
}
