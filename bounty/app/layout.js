import "./globals.css";
import Navigation from "../components/Navigation";
import LegalBanner from "../components/LegalBanner";

export const metadata = {
  title: "WebSec CTF - Web Security Training Platform",
  description: "Learn web application security through hands-on challenges. Practice identifying and exploiting vulnerabilities in a controlled environment.",
  keywords: "web security, CTF, penetration testing, training, OWASP, vulnerabilities",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-900 text-white min-h-screen antialiased">
        <LegalBanner />
        <Navigation />
        <main className="min-h-[calc(100vh-4rem)] pt-4">
          {children}
        </main>
        <footer className="bg-gray-900 border-t border-gray-800 py-16 mt-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                © 2025 WebSec CTF Training Platform
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
