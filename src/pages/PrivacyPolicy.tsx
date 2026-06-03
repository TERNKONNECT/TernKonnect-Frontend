import MainLayout from "@/components/layouts/MainLayout";

const PrivacyPolicy = () => {
  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last Updated: June 2026</p>

        <div className="space-y-8 text-foreground/80 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Introduction</h2>
            <p className="mb-4">
              TernKonnect ("TernKonnect," "we," "our," or "us") is committed to protecting the privacy, security, and integrity of personal information entrusted to us by learners, educators, training partners, employers, institutions, and website visitors.
            </p>
            <p className="mb-4">
              This Privacy Policy explains how we collect, use, store, protect, and share information when you access or use our website, learning platforms, training programs, digital services, applications, events, and partner-supported educational initiatives.
            </p>
            <p>
              By accessing or using our services, you agree to the practices described in this Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Information We Collect</h2>
            <p className="mb-4">We may collect the following categories of information:</p>
            
            <h3 className="text-xl font-medium mt-4 mb-2">Personal Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Organization or institution</li>
              <li>Job title</li>
              <li>Location information</li>
              <li>Profile photographs (where provided)</li>
              <li>Account credentials</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">Learning and Training Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Course enrollments</li>
              <li>Learning progress</li>
              <li>Attendance records</li>
              <li>Assessment results</li>
              <li>Certifications and badges earned</li>
              <li>Program participation history</li>
              <li>Skills and competency records</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">Technical Information</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>IP address</li>
              <li>Browser type</li>
              <li>Device information</li>
              <li>Operating system</li>
              <li>Usage logs</li>
              <li>Website interactions</li>
              <li>Cookies and similar technologies</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">Communications</h3>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Messages sent through our platforms</li>
              <li>Support requests</li>
              <li>Feedback submissions</li>
              <li>Survey responses</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">3. How We Use Information</h2>
            <p className="mb-4">We use information to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Deliver educational programs and learning services</li>
              <li>Manage learner registrations and enrollments</li>
              <li>Track attendance and learning outcomes</li>
              <li>Issue certificates and credentials</li>
              <li>Provide customer support</li>
              <li>Improve platform performance and user experience</li>
              <li>Conduct program monitoring and evaluation</li>
              <li>Generate anonymized analytics and impact reports</li>
              <li>Communicate important service updates</li>
              <li>Meet legal, regulatory, and contractual obligations</li>
              <li>Prevent fraud, misuse, and unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Educational Data and Learning Analytics</h2>
            <p className="mb-4">
              As an education-focused organization, TernKonnect may process learner participation and performance data to:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Measure learning outcomes</li>
              <li>Improve course quality</li>
              <li>Support workforce development initiatives</li>
              <li>Evaluate program effectiveness</li>
              <li>Produce aggregated impact reports for funders, partners, and stakeholders</li>
            </ul>
            <p>
              Where possible, reports are generated using aggregated or anonymized data that does not directly identify individual learners.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">5. Information Sharing</h2>
            <p className="mb-4 font-semibold">We do not sell personal information.</p>
            <p className="mb-4">We may share information with:</p>

            <h3 className="text-xl font-medium mt-4 mb-2">Educational and Program Partners</h3>
            <p className="mb-4">
              Authorized training institutions, employers, sponsors, certification bodies, and implementation partners involved in delivering educational programs.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">Service Providers</h3>
            <p className="mb-2">Trusted vendors who help us operate our platforms, including:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Cloud hosting providers</li>
              <li>Learning management systems</li>
              <li>Communication services</li>
              <li>Analytics providers</li>
              <li>Payment processors</li>
            </ul>

            <h3 className="text-xl font-medium mt-4 mb-2">Legal Requirements</h3>
            <p className="mb-4">
              We may disclose information where required by law, regulation, court order, or lawful government request.
            </p>

            <h3 className="text-xl font-medium mt-4 mb-2">Business Transfers</h3>
            <p>
              If TernKonnect undergoes a merger, acquisition, restructuring, or asset transfer, information may be transferred as part of that transaction, subject to applicable privacy protections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Data Security</h2>
            <p className="mb-4">TernKonnect takes data protection seriously.</p>
            <p className="mb-4">
              We have implemented strong safeguards to ensure data is secure and responsibly managed across our platform and partner ecosystem.
            </p>
            <p className="mb-2">These safeguards include:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Encryption of data in transit and at rest where applicable</li>
              <li>Role-based access controls</li>
              <li>Secure authentication procedures</li>
              <li>Continuous monitoring and threat detection</li>
              <li>Regular security assessments</li>
              <li>Secure cloud infrastructure</li>
              <li>Staff confidentiality obligations</li>
              <li>Vendor security reviews and contractual safeguards</li>
            </ul>
            <p>
              While no system can guarantee absolute security, we continuously maintain and improve our technical and organizational measures to protect personal information against unauthorized access, disclosure, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Data Retention</h2>
            <p className="mb-2">We retain personal information only for as long as necessary to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Deliver educational services</li>
              <li>Maintain learning records</li>
              <li>Meet reporting obligations</li>
              <li>Comply with legal requirements</li>
              <li>Resolve disputes and enforce agreements</li>
            </ul>
            <p>
              When information is no longer required, it is securely deleted, anonymized, or archived according to our retention policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Children's Privacy</h2>
            <p className="mb-4">TernKonnect may support educational programs involving young learners.</p>
            <p className="mb-4">
              Where programs involve minors, we implement appropriate safeguards and obtain required permissions from parents, guardians, schools, institutions, or authorized program administrators as required by applicable law.
            </p>
            <p>
              We do not knowingly collect personal information from children without appropriate authorization.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Cookies and Tracking Technologies</h2>
            <p className="mb-2">We use cookies and similar technologies to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Maintain platform functionality</li>
              <li>Improve user experience</li>
              <li>Understand platform usage</li>
              <li>Enhance security</li>
              <li>Measure service performance</li>
            </ul>
            <p>
              Users may manage cookie preferences through their browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">10. International Data Transfers</h2>
            <p className="mb-4">
              As part of our operations, information may be processed in countries where our service providers, partners, or infrastructure are located.
            </p>
            <p>
              Where international transfers occur, we implement appropriate safeguards to protect personal information in accordance with applicable privacy laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Your Privacy Rights</h2>
            <p className="mb-2">Depending on your location and applicable law, you may have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-1">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of personal information</li>
              <li>Restrict or object to processing</li>
              <li>Withdraw consent where applicable</li>
              <li>Request data portability</li>
              <li>Lodge a complaint with a relevant regulatory authority</li>
            </ul>
            <p>
              Requests may be submitted using the contact information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Third-Party Links</h2>
            <p className="mb-4">
              Our website and platforms may contain links to third-party websites, educational resources, or partner services.
            </p>
            <p>
              We are not responsible for the privacy practices of third-party services and encourage users to review their privacy policies before sharing information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">13. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically to reflect legal, operational, technological, or service changes.
            </p>
            <p>
              Updated versions will be posted on our website with a revised effective date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-foreground">14. Contact Us</h2>
            <p className="mb-4">
              If you have questions about this Privacy Policy or our data protection practices, please contact:
            </p>
            <div className="bg-muted p-6 rounded-lg">
              <p className="font-semibold mb-2">TernKonnect</p>
              <p>Website: <a href="https://www.ternkonnect.com" className="text-primary hover:underline">https://www.ternkonnect.com</a></p>
              <p className="mb-4">Email: <a href="mailto:privacy@ternkonnect.com" className="text-primary hover:underline">privacy@ternkonnect.com</a></p>
              <p className="text-sm italic">
                For data protection or privacy-related inquiries, please include "Privacy Request" in the subject line.
              </p>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default PrivacyPolicy;
