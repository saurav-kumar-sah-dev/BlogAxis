import { useTheme } from '../context/ThemeContext';

export default function Privacy() {
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Privacy Policy
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
              Introduction
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              At BlogAxis, we are committed to protecting your privacy and ensuring the security of your 
              personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard 
              your information when you use our platform.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              1. Information We Collect
            </h2>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200">
                Personal Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                When you create an account, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Name (first and last name)</li>
                <li>Email address</li>
                <li>Username</li>
                <li>Date of birth</li>
                <li>Profile information (bio, location, additional info)</li>
                <li>Profile picture (if uploaded)</li>
              </ul>
              
              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-6">
                Content Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We store the content you create and share:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>Blog posts and articles</li>
                <li>Comments and replies</li>
                <li>Images and media files</li>
                <li>Document uploads</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mt-6">
                Usage Information
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We automatically collect certain information about your use of our service:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent</li>
                <li>Interactions with content (likes, comments, follows)</li>
                <li>Search queries</li>
              </ul>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              2. How We Use Your Information
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use your information to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Provide and maintain our blogging platform</li>
              <li>Create and manage your account</li>
              <li>Display your content and profile to other users</li>
              <li>Enable social features (following, commenting, liking)</li>
              <li>Send you important updates about our service</li>
              <li>Improve our platform and develop new features</li>
              <li>Ensure platform security and prevent abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              3. Information Sharing and Disclosure
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share 
                your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                <li><strong>Public Content:</strong> Your posts, comments, and profile information are visible to other users</li>
                <li><strong>Service Providers:</strong> We may share data with trusted third-party services that help us operate our platform</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights</li>
                <li><strong>Safety and Security:</strong> We may share information to prevent fraud, abuse, or illegal activities</li>
                <li><strong>Business Transfers:</strong> In case of merger or acquisition, user data may be transferred</li>
              </ul>
            </div>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              4. Data Security
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We implement appropriate security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure password hashing and storage</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
              <li>Secure cloud infrastructure</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to 
              protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              5. Your Rights and Choices
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Access:</strong> View and download your personal data</li>
              <li><strong>Update:</strong> Modify your profile and account information</li>
              <li><strong>Delete:</strong> Remove your account and associated data</li>
              <li><strong>Portability:</strong> Export your content and data</li>
              <li><strong>Restriction:</strong> Limit how we process your information</li>
              <li><strong>Objection:</strong> Opt out of certain data processing activities</li>
            </ul>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              6. Cookies and Tracking
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li>Remember your login status and preferences</li>
              <li>Analyze how you use our platform</li>
              <li>Improve our service and user experience</li>
              <li>Provide personalized content and features</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              You can control cookie settings through your browser, but disabling cookies may affect 
              the functionality of our platform.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              7. Third-Party Services
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Our platform integrates with third-party services:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
              <li><strong>Google OAuth:</strong> For social login functionality</li>
              <li><strong>Cloudinary:</strong> For image and media storage</li>
              <li><strong>MongoDB Atlas:</strong> For secure data storage</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              These services have their own privacy policies. We encourage you to review them.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              8. Children's Privacy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Our service is not intended for children under 13 years of age. We do not knowingly 
              collect personal information from children under 13. If you are a parent or guardian 
              and believe your child has provided us with personal information, please contact us 
              so we can delete such information.
            </p>
          </section>

          {/* Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              9. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date. 
              We encourage you to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              10. Contact Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
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
              This Privacy Policy is effective as of the date listed above and will remain in effect 
              except with respect to any changes in its provisions in the future.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
