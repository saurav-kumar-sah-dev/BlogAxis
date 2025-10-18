import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { isDark } = useTheme();

  return (
    <footer className="relative overflow-hidden w-full">
      {/* Background gradient - match header */}
      <div 
        className="absolute inset-0 opacity-90"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 50%, #45b7d1 100%)'
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="absolute bottom-0 right-0 w-16 h-16 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.15)' }} />
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            {/* Brand section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <span className="text-2xl">✨</span>
                <h3 className="text-lg font-bold" style={{ color: isDark ? '#f7fafc' : '#2d3748' }}>
                  My Blog
                </h3>
              </div>
              <p className="text-sm opacity-80" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                Share your stories, connect with readers, and build your community.
              </p>
            </div>

            {/* Quick links */}
            <div className="text-center">
              <h4 className="font-semibold mb-3" style={{ color: isDark ? '#f7fafc' : '#2d3748' }}>
                🔗 Quick Links
              </h4>
              <div className="space-y-2">
                <a href="#about" className="block text-sm hover:opacity-80 transition-opacity" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  📖 About Us
                </a>
                <a href="#contact" className="block text-sm hover:opacity-80 transition-opacity" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  📧 Contact
                </a>
                <a href="#privacy" className="block text-sm hover:opacity-80 transition-opacity" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                  🔒 Privacy Policy
                </a>
              </div>
            </div>

            {/* Social links */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-3" style={{ color: isDark ? '#f7fafc' : '#2d3748' }}>
                🌐 Connect
              </h4>
              <div className="flex justify-center md:justify-end gap-3">
                <a href="#" className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <span className="text-lg">📘</span>
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <span className="text-lg">🐦</span>
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <span className="text-lg">📷</span>
                </a>
                <a href="#" className="p-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300">
                  <span className="text-lg">💼</span>
                </a>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6" style={{ borderColor: isDark ? '#4a5568' : '#e2e8f0' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm opacity-80" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                © {new Date().getFullYear()} My Blog. Made with ❤️ for storytellers.
              </p>
              <div className="flex items-center gap-2 text-sm opacity-80" style={{ color: isDark ? '#cbd5e0' : '#4a5568' }}>
                <span>🚀</span>
                <span>Powered by React & Node.js</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}


