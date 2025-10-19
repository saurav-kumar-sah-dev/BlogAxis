import { useTheme } from '../context/ThemeContext';

export default function About() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About BlogAxis
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Empowering voices, connecting communities, and sharing stories that matter.
          </p>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Welcome to the Future of Blogging
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              BlogAxis is more than just a blogging platform - it's a community where ideas flourish, 
              stories are shared, and connections are made. Join thousands of writers, thinkers, and 
              creators who are shaping the digital conversation.
            </p>
          </div>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Mission</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To democratize content creation by providing a powerful, user-friendly platform that 
              empowers individuals to share their stories, expertise, and perspectives with the world. 
              We believe everyone has a voice worth hearing.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔮</span>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">Our Vision</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To become the world's leading platform for authentic storytelling and knowledge sharing, 
              where diverse voices come together to create meaningful conversations and drive positive change.
            </p>
          </div>
        </div>

        {/* What Makes Us Different */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white text-center mb-8">
            What Makes BlogAxis Special?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Rich Content Types</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Support for text, images, videos, documents, and articles - express yourself in any format.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Community Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Follow other users, engage with comments, and build meaningful connections.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Privacy & Security</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your data is protected with industry-standard security measures and privacy controls.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Responsive Design</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Beautiful, responsive interface that works perfectly on all devices and screen sizes.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌙</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dark Mode</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comfortable reading experience with built-in dark mode and theme customization.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fast Performance</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Optimized for speed with modern technologies and efficient content delivery.
              </p>
            </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white text-center mb-8">
            Our Story
          </h2>
          
          <div className="prose prose-lg max-w-none text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed mb-6">
              BlogAxis was born from a simple observation: the internet is full of amazing stories, 
              insights, and knowledge, but finding a platform that truly supports creators and 
              fosters meaningful conversations can be challenging.
            </p>
            
            <p className="leading-relaxed mb-6">
              As a MERN Stack Developer and Final-Year B.Tech CSE student, I (Saurav Kumar Sah) 
              built BlogAxis with a shared vision: to create a blogging platform that puts users first. 
              I wanted to build something that was not only powerful and feature-rich, but also 
              intuitive, secure, and genuinely supportive of the creative process.
            </p>
            
            <p className="leading-relaxed mb-6">
              Today, BlogAxis serves users worldwide, from individual bloggers sharing their personal 
              stories to professionals building their thought leadership. The platform is constantly 
              evolving based on user feedback and the changing needs of the digital content landscape.
            </p>
            
            <p className="leading-relaxed">
              I believe that everyone has something valuable to share, and I'm committed to 
              providing the tools and community support needed to make those voices heard. 
              This project showcases my skills in React, Node.js, Express, MongoDB, and modern web development.
            </p>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white text-center mb-8">
            Built with Modern Technology
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">R</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">React</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Frontend Framework</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-yellow-600">N</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Node.js</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Backend Runtime</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-green-600">M</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">MongoDB</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Database</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold text-blue-600">E</span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Express</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">Web Framework</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Plus Tailwind CSS, Cloudinary, JWT Authentication, and many other modern technologies 
              that ensure a fast, secure, and scalable platform.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
            Join thousands of creators who are already sharing their stories on BlogAxis. 
            Your voice matters, and we're here to help you share it with the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/register"
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Get Started Free
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors"
            >
              Contact Us
            </a>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-white/80 mb-4">Connect with the developer:</p>
            <div className="flex justify-center gap-4">
              <a
                href="https://github.com/saurav-kumar-sah-dev"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                📘 GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/sauravkumarsah-dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                💼 LinkedIn
              </a>
              <a
                href="mailto:sauravshubham903@gmail.com"
                className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                📧 Email
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
