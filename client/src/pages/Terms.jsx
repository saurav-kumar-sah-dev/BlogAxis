import { useTheme } from '../context/ThemeContext';

export default function Terms() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to BlogAxis
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              These Terms and Conditions ("Terms") govern your use of BlogAxis ("we," "our," or "us") 
              and the services we provide. By accessing or using our platform, you agree to be bound 
              by these Terms.
            </p>
          </section>

          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              By creating an account, accessing, or using BlogAxis, you acknowledge that you have 
              read, understood, and agree to be bound by these Terms and our Privacy Policy.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              If you do not agree to these Terms, please do not use our service.
            </p>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. User Accounts
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                To use certain features of BlogAxis, you must create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your account information</li>
                <li>Keep your password secure and confidential</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be at least 13 years old to create an account</li>
              </ul>
            </div>
          </section>

          {/* Content Guidelines */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Content Guidelines
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You are responsible for all content you post on BlogAxis. You agree not to post content that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Is illegal, harmful, or violates any laws</li>
                <li>Contains hate speech, harassment, or discrimination</li>
                <li>Is spam, misleading, or fraudulent</li>
                <li>Violates intellectual property rights</li>
                <li>Contains personal information of others without consent</li>
                <li>Is sexually explicit or inappropriate</li>
                <li>Promotes violence or dangerous activities</li>
              </ul>
            </div>
          </section>

          {/* Privacy and Data */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Privacy and Data Protection
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We are committed to protecting your privacy. Our Privacy Policy explains how we collect, 
              use, and protect your information. By using BlogAxis, you consent to our data practices 
              as described in our Privacy Policy.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time.
            </p>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Account Termination
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                You may delete your account at any time through your profile settings. When you delete 
                your account:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Your account and profile will be permanently deleted</li>
                <li>All your posts, comments, and content will be removed</li>
                <li>This action cannot be undone</li>
                <li>You will lose access to all your data and content</li>
              </ul>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We may also suspend or terminate accounts that violate these Terms.
              </p>
            </div>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You retain ownership of the content you create and post on BlogAxis. However, by posting 
              content, you grant us a license to display, distribute, and modify your content as 
              necessary to provide our services.
            </p>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              BlogAxis and its original content, features, and functionality are owned by us and 
              protected by international copyright, trademark, and other intellectual property laws.
            </p>
          </section>

          {/* Disclaimers */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Disclaimers
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              BlogAxis is provided "as is" without warranties of any kind. We do not guarantee that 
              our service will be uninterrupted, secure, or error-free. You use our service at your 
              own risk.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              To the maximum extent permitted by law, BlogAxis shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages resulting from your use of our service.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Changes to Terms
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update these Terms from time to time. We will notify users of significant changes 
              through our platform or via email. Your continued use of BlogAxis after changes constitutes 
              acceptance of the new Terms.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have any questions about these Terms and Conditions, please contact us:
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-gray-700 dark:text-gray-300">
                <strong>Email:</strong> sauravshubham903@gmail.com<br />
                <strong>Website:</strong> https://blog-axis.vercel.app<br />
                <strong>GitHub:</strong> <a href="https://github.com/saurav-kumar-sah-dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">https://github.com/saurav-kumar-sah-dev</a><br />
                <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/sauravkumarsah-dev/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">https://www.linkedin.com/in/sauravkumarsah-dev/</a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-8">
            <p className="text-center text-gray-500 dark:text-gray-400">
              By using BlogAxis, you acknowledge that you have read and understood these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
