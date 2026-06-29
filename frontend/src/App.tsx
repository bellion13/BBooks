import { Header } from "./components/layout/Header";
import { Footer } from "./components/layout/Footer";
import { AuthProvider } from "./store/AuthContext";
import { AuthModal } from "./components/shared/AuthModal";
import { ToastContainer } from "./components/shared/ToastContainer";
import { AppRouter } from "./routes/AppRouter";
import { useAuthModalStore } from "./store/useAuthModalStore";
import "./index.css";

function AppContent() {
  const { isOpen, close } = useAuthModalStore();

  return (
    <>
      <Header />
      <AppRouter />
      <Footer />
      <AuthModal isOpen={isOpen} onClose={close} />
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
