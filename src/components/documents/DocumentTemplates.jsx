// Sierra Leone HR Document Templates
// Based on Employment Act 2023 and local labor laws

export const DOCUMENT_TYPE_INFO = {
  employment_contract: {
    label: "Employment Contract",
    icon: "FileText",
    description: "Standard employment agreement",
    requiresSignature: true
  },
  nda: {
    label: "Non-Disclosure Agreement",
    icon: "Lock",
    description: "Confidentiality agreement",
    requiresSignature: true
  },
  code_of_conduct: {
    label: "Code of Conduct",
    icon: "Shield",
    description: "Workplace behavior standards",
    requiresSignature: true
  },
  privacy_policy: {
    label: "Privacy Policy",
    icon: "Eye",
    description: "Data protection acknowledgment",
    requiresSignature: true
  },
  health_safety_policy: {
    label: "Health & Safety Policy",
    icon: "Heart",
    description: "Workplace safety guidelines",
    requiresSignature: true
  },
  anti_harassment_policy: {
    label: "Anti-Harassment Policy",
    icon: "UserX",
    description: "Harassment prevention policy",
    requiresSignature: true
  },
  it_acceptable_use: {
    label: "IT Acceptable Use Policy",
    icon: "Monitor",
    description: "Technology usage guidelines",
    requiresSignature: true
  },
  disciplinary_policy: {
    label: "Disciplinary Policy",
    icon: "AlertTriangle",
    description: "Disciplinary procedures",
    requiresSignature: true
  },
  leave_policy: {
    label: "Leave Policy",
    icon: "Calendar",
    description: "Leave entitlements and procedures",
    requiresSignature: true
  },
  remote_work_policy: {
    label: "Remote Work Policy",
    icon: "Home",
    description: "Work from home guidelines",
    requiresSignature: true
  },
  probation_confirmation: {
    label: "Probation Confirmation",
    icon: "CheckCircle",
    description: "Confirmation of employment after probation",
    requiresSignature: true
  },
  promotion_letter: {
    label: "Promotion Letter",
    icon: "TrendingUp",
    description: "Promotion notification",
    requiresSignature: true
  },
  termination_letter: {
    label: "Termination Letter",
    icon: "XCircle",
    description: "Employment termination notice",
    requiresSignature: false
  },
  warning_letter: {
    label: "Warning Letter",
    icon: "AlertCircle",
    description: "Disciplinary warning",
    requiresSignature: true
  },
  salary_revision: {
    label: "Salary Revision Letter",
    icon: "DollarSign",
    description: "Salary adjustment notification",
    requiresSignature: true
  },
  custom: {
    label: "Custom Document",
    icon: "File",
    description: "Custom HR document",
    requiresSignature: true
  }
};

// Default templates for Sierra Leone
export const DEFAULT_TEMPLATES = {
  employment_contract: {
    name: "Standard Employment Contract",
    content: `
<div class="sl-document">
  <div class="sl-watermark">OFFICIAL</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">{{company_initial}}</div>
    <h1>Employment Contract</h1>
    <p class="sl-subtitle">In accordance with the Employment Act 2023 of Sierra Leone</p>
    <p class="sl-ref-number">Ref: EC-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>Parties to This Agreement</h2>
    <div class="sl-parties-box">
      <div class="sl-party employer">
        <h3>🏢 Employer</h3>
        <p><strong>{{company_name}}</strong></p>
        <p>📍 {{company_address}}</p>
        <p>📋 Reg. No: {{company_registration}}</p>
        <p>📞 {{company_phone}}</p>
      </div>
      <div class="sl-party">
        <h3>👤 Employee</h3>
        <p><strong>{{employee_name}}</strong></p>
        <p>📍 {{employee_address}}</p>
        <p>🆔 ID: {{employee_id_number}}</p>
        <p>📧 {{employee_email}}</p>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>1. Commencement & Duration</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Start Date</label>
        <span>{{start_date}}</span>
      </div>
      <div class="sl-info-item">
        <label>Contract Type</label>
        <span>{{contract_type}}</span>
      </div>
      <div class="sl-info-item">
        <label>Probation Period</label>
        <span>{{probation_period}} months</span>
      </div>
      <div class="sl-info-item">
        <label>Work Location</label>
        <span>{{work_location}}</span>
      </div>
    </div>
    <p>The probationary period is as permitted under Section 21 of the Employment Act 2023 (maximum 6 months).</p>
  </div>

  <div class="sl-section">
    <h2>2. Position & Responsibilities</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Position</label>
        <span>{{position}}</span>
      </div>
      <div class="sl-info-item">
        <label>Department</label>
        <span>{{department}}</span>
      </div>
      <div class="sl-info-item">
        <label>Reports To</label>
        <span>{{reports_to}}</span>
      </div>
      <div class="sl-info-item">
        <label>Work Schedule</label>
        <span>{{work_schedule}}</span>
      </div>
    </div>
    <p><strong>Key Responsibilities:</strong></p>
    <p>{{job_duties}}</p>
  </div>

  <div class="sl-section">
    <h2>3. Remuneration Package</h2>
    <div class="sl-highlight-box">
      <h3>💰 Monthly Compensation</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item">
          <label>Gross Salary</label>
          <span>SLE {{monthly_salary}}</span>
        </div>
        <div class="sl-info-item">
          <label>Payment Date</label>
          <span>{{pay_day}} of each month</span>
        </div>
        <div class="sl-info-item">
          <label>Payment Method</label>
          <span>{{payment_method}}</span>
        </div>
        <div class="sl-info-item">
          <label>Working Hours</label>
          <span>{{working_hours}} hours/week</span>
        </div>
      </div>
    </div>
    <p><strong>Allowances:</strong></p>
    <ul>
      {{allowances_list}}
    </ul>
    <p><strong>Statutory Deductions:</strong> NASSIT (5% employee contribution), PAYE (as applicable per NRA tax brackets)</p>
  </div>

  <div class="sl-section">
    <h2>4. Leave Entitlements</h2>
    <p>Per the Employment Act 2023 of Sierra Leone:</p>
    <ul>
      <li><strong>Annual Leave:</strong> 21 working days after 12 months of continuous service</li>
      <li><strong>Sick Leave:</strong> 5 days paid sick leave per year (medical certificate required)</li>
      <li><strong>Maternity Leave:</strong> 14 weeks (applicable to female employees)</li>
      <li><strong>Paternity Leave:</strong> 5 days (applicable to male employees)</li>
      <li><strong>Compassionate Leave:</strong> 5 days for immediate family bereavement</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Termination Provisions</h2>
    <p>Either party may terminate this contract by giving written notice as follows:</p>
    <ul>
      <li>During probation: 7 days written notice</li>
      <li>Less than 3 years service: 1 month notice</li>
      <li>3-5 years service: 2 months notice</li>
      <li>Over 5 years service: 3 months notice</li>
    </ul>
    <p>Summary dismissal may occur for gross misconduct as defined in Section 91 of the Employment Act 2023. Upon termination, the Employee shall be entitled to all outstanding remuneration and benefits accrued.</p>
  </div>

  <div class="sl-section">
    <h2>6. Confidentiality & Conduct</h2>
    <p>The Employee agrees to maintain strict confidentiality of all proprietary information during and after employment. The Employee shall conduct themselves professionally and in accordance with the Company's Code of Conduct.</p>
  </div>

  <div class="sl-section">
    <h2>7. Governing Law</h2>
    <p>This contract shall be governed by the laws of the Republic of Sierra Leone, including the Employment Act 2023, and any disputes shall be subject to the jurisdiction of Sierra Leone courts.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Declaration</h2>
    <p>Both parties hereby acknowledge that they have read, understood, and agree to all terms and conditions set forth in this Employment Contract. This agreement supersedes all prior discussions and agreements.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For the Employer</h4>
      <p><strong>{{employer_signatory}}</strong></p>
      <p>{{employer_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
      <p style="font-size: 10px; color: #888; margin-top: 5px;">Authorized Signature</p>
    </div>
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>{{position}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This document was generated and digitally signed using {{company_name}}'s HR Management System. Digital signatures are legally binding under Sierra Leone law.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "company_initial", label: "Company Initial", type: "text", auto_fill: "organisation.name" },
      { key: "company_address", label: "Company Address", type: "text", auto_fill: "organisation.address", default: "Freetown, Sierra Leone" },
      { key: "company_registration", label: "Registration Number", type: "text", auto_fill: "organisation.business_registration_number", default: "N/A" },
      { key: "company_phone", label: "Company Phone", type: "text", auto_fill: "organisation.phone", default: "N/A" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Full Name", type: "text", auto_fill: "employee.full_name" },
      { key: "employee_address", label: "Employee Address", type: "text", auto_fill: "employee.address", default: "Freetown, Sierra Leone" },
      { key: "employee_id_number", label: "Employee ID/Passport", type: "text", default: "N/A" },
      { key: "employee_email", label: "Employee Email", type: "text", auto_fill: "employee.user_email" },
      { key: "start_date", label: "Start Date", type: "date", auto_fill: "employee.hire_date" },
      { key: "probation_period", label: "Probation Period", type: "select", options: ["3", "6"], default: "3" },
      { key: "contract_type", label: "Contract Type", type: "select", options: ["Permanent", "Fixed-Term", "Temporary"], default: "Permanent" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "reports_to", label: "Reports To", type: "text", default: "Line Manager" },
      { key: "job_duties", label: "Job Duties", type: "text", default: "As per job description and assigned tasks" },
      { key: "work_location", label: "Work Location", type: "text", auto_fill: "employee.assigned_location_name", default: "Head Office" },
      { key: "monthly_salary", label: "Monthly Salary (SLE)", type: "number", auto_fill: "employee.base_salary" },
      { key: "pay_day", label: "Pay Day", type: "select", options: ["25th", "Last working day", "1st of following month"], default: "25th" },
      { key: "payment_method", label: "Payment Method", type: "select", options: ["Bank Transfer", "Mobile Money", "Cheque", "Cash"], default: "Bank Transfer" },
      { key: "allowances_list", label: "Allowances", type: "text", default: "<li>Transport Allowance</li><li>Medical Allowance</li>" },
      { key: "working_hours", label: "Weekly Working Hours", type: "number", default: "40" },
      { key: "work_schedule", label: "Work Schedule", type: "text", default: "Monday to Friday, 8:00 AM - 5:00 PM" },
      { key: "employer_signatory", label: "Employer Signatory", type: "text", default: "HR Manager" },
      { key: "employer_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  },

  code_of_conduct: {
    name: "Employee Code of Conduct",
    content: `
<div class="sl-document">
  <div class="sl-watermark">POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">{{company_initial}}</div>
    <h1>Employee Code of Conduct</h1>
    <p class="sl-subtitle">{{company_name}} • Standards of Professional Behavior</p>
    <p class="sl-ref-number">Ref: COC-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>Preamble</h2>
    <p>This Code of Conduct establishes the fundamental standards of behavior, ethical principles, and professional expectations for all employees of <strong>{{company_name}}</strong>. Our organization is committed to fostering a workplace culture built on integrity, mutual respect, accountability, and excellence.</p>
    <p>Every employee, regardless of position or tenure, is expected to uphold these standards in all their professional interactions. This Code reflects our commitment to ethical business practices and our responsibility to our colleagues, customers, partners, and the communities we serve in Sierra Leone.</p>
  </div>

  <div class="sl-section">
    <h2>1. Core Values & Professional Standards</h2>
    <p><strong>{{company_name}}</strong> expects all employees to embody the following principles:</p>
    <ul>
      <li><strong>Integrity:</strong> Act honestly and transparently in all business dealings. Never misrepresent facts, falsify records, or engage in deceptive practices</li>
      <li><strong>Excellence:</strong> Perform all duties with diligence, competence, and a commitment to quality. Continuously seek to improve your skills and knowledge</li>
      <li><strong>Respect:</strong> Treat all colleagues, clients, vendors, and stakeholders with dignity, courtesy, and professionalism regardless of their background or position</li>
      <li><strong>Accountability:</strong> Take ownership of your actions and decisions. Admit mistakes promptly and work to correct them</li>
      <li><strong>Teamwork:</strong> Collaborate effectively with colleagues, share knowledge, and support the success of others</li>
      <li><strong>Punctuality:</strong> Arrive at work on time, attend meetings as scheduled, and meet all deadlines. Notify your supervisor promptly if delays are unavoidable</li>
      <li><strong>Professional Appearance:</strong> Maintain appropriate dress and grooming standards as per company dress code guidelines. Represent the company positively at all times</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Workplace Conduct & Behavior</h2>
    <p>To maintain a safe, respectful, and productive work environment, the following behaviors are expected:</p>
    <ul>
      <li><strong>Zero Tolerance for Harassment:</strong> Any form of harassment—sexual, verbal, physical, or psychological—is strictly prohibited and will result in immediate disciplinary action</li>
      <li><strong>Non-Discrimination:</strong> Treat all individuals fairly regardless of race, gender, religion, ethnicity, age, disability, political affiliation, or any other protected characteristic as defined by Sierra Leone law</li>
      <li><strong>Violence-Free Workplace:</strong> Physical violence, threats, intimidation, or aggressive behavior will not be tolerated under any circumstances</li>
      <li><strong>Substance-Free Environment:</strong> Reporting to work under the influence of alcohol or illegal drugs is prohibited. Consumption of alcohol during work hours or on company premises is forbidden except at authorized company events</li>
      <li><strong>No Gambling:</strong> Gambling activities on company premises or using company resources are strictly prohibited</li>
      <li><strong>Professional Relationships:</strong> Personal relationships between employees must not interfere with professional duties, create conflicts of interest, or result in favoritism</li>
      <li><strong>Respectful Communication:</strong> Use professional, respectful language in all communications. Avoid gossip, rumors, or negative talk about colleagues</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Confidentiality & Information Security</h2>
    <p>Protecting company information is a critical responsibility of every employee:</p>
    <ul>
      <li><strong>Confidential Information:</strong> Never disclose trade secrets, business strategies, financial data, customer information, or any proprietary information to unauthorized parties</li>
      <li><strong>Data Protection:</strong> Handle all personal data of customers, employees, and partners in strict compliance with privacy policies and applicable data protection principles</li>
      <li><strong>Secure Storage:</strong> Store confidential documents securely. Lock files and cabinets, use strong passwords, and encrypt sensitive digital files</li>
      <li><strong>Clean Desk Policy:</strong> Keep workspaces clear of sensitive documents when unattended. Shred confidential papers before disposal</li>
      <li><strong>Post-Employment Obligations:</strong> Confidentiality obligations continue after employment ends. Return all company materials, documents, and data upon separation</li>
      <li><strong>Social Media Caution:</strong> Never share confidential company information on social media platforms or discuss internal matters publicly</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Company Resources & Property</h2>
    <p>Company assets are provided to enable you to perform your duties effectively:</p>
    <ul>
      <li><strong>Authorized Use:</strong> Use company equipment, vehicles, supplies, and facilities primarily for legitimate business purposes</li>
      <li><strong>Personal Use Limits:</strong> Minimal personal use of company resources (phone, email, internet) is permitted provided it does not interfere with work productivity or violate any policies</li>
      <li><strong>Care & Maintenance:</strong> Treat company property with care. Report any damage, malfunction, or loss immediately to your supervisor or the appropriate department</li>
      <li><strong>Prohibited Activities:</strong> Never use company resources for illegal activities, personal business ventures, political campaigns, or any purpose that could harm the company's reputation</li>
      <li><strong>Software & Licensing:</strong> Only use licensed software. Do not install unauthorized applications on company devices</li>
      <li><strong>Return of Property:</strong> All company property must be returned in good condition upon resignation, termination, or when requested</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Conflict of Interest</h2>
    <p>Employees must avoid situations where personal interests could conflict with company interests:</p>
    <ul>
      <li><strong>Full Disclosure:</strong> Immediately disclose any actual, potential, or perceived conflicts of interest to your supervisor or HR department</li>
      <li><strong>Outside Employment:</strong> Secondary employment is permitted only if it does not interfere with your duties, compete with {{company_name}}, or create conflicts. Prior written approval may be required</li>
      <li><strong>Business Relationships:</strong> Do not engage in business transactions with family members or close friends on behalf of the company without disclosure and approval</li>
      <li><strong>Gifts & Entertainment:</strong> Do not accept gifts, favors, entertainment, or hospitality that could influence or appear to influence your business decisions. Modest gifts under SLE {{gift_threshold}} may be acceptable. Report larger offers to management</li>
      <li><strong>Financial Interests:</strong> Avoid holding significant financial interests in competitors, suppliers, or customers that could affect your judgment</li>
      <li><strong>Intellectual Property:</strong> Any inventions, innovations, or work products created during employment belong to the company as per your employment agreement</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Legal & Regulatory Compliance</h2>
    <p>All employees must operate within the law:</p>
    <ul>
      <li><strong>Sierra Leone Laws:</strong> Comply fully with all applicable laws and regulations of the Republic of Sierra Leone</li>
      <li><strong>Employment Act 2023:</strong> Adhere to all provisions of the Employment Act and related labor regulations</li>
      <li><strong>Anti-Corruption:</strong> Never offer, pay, solicit, or accept bribes, kickbacks, or improper payments. Report any such attempts immediately</li>
      <li><strong>Tax Compliance:</strong> Ensure all personal and business tax obligations are met, including PAYE and NASSIT contributions</li>
      <li><strong>Whistleblowing:</strong> Report any suspected illegal activities, fraud, or policy violations through appropriate channels. Whistleblowers are protected from retaliation</li>
      <li><strong>Cooperation with Authorities:</strong> Cooperate fully with any lawful investigations by regulatory authorities</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Health, Safety & Environment</h2>
    <ul>
      <li>Follow all health and safety policies, procedures, and guidelines</li>
      <li>Report unsafe conditions, accidents, or near-misses immediately</li>
      <li>Use required personal protective equipment (PPE) as directed</li>
      <li>Participate in safety training and emergency drills</li>
      <li>Support environmental sustainability initiatives and reduce waste where possible</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Consequences of Violations</h2>
    <p>Violations of this Code of Conduct are taken seriously and may result in disciplinary action proportionate to the severity of the offense:</p>
    <ul>
      <li><strong>Verbal Warning:</strong> For minor, first-time infractions with counseling and guidance</li>
      <li><strong>Written Warning:</strong> Formal documentation of the violation with expectations for improvement</li>
      <li><strong>Final Written Warning:</strong> Last opportunity to correct behavior before termination</li>
      <li><strong>Suspension:</strong> Temporary removal from duties with or without pay pending investigation or as punishment</li>
      <li><strong>Demotion:</strong> Reduction in rank, responsibilities, or compensation</li>
      <li><strong>Termination:</strong> Immediate or notice-based dismissal for serious or repeated violations</li>
    </ul>
    <p>Gross misconduct—including theft, violence, fraud, harassment, or serious safety violations—may result in summary dismissal without prior warnings, as permitted under Section 91 of the Employment Act 2023.</p>
  </div>

  <div class="sl-section">
    <h2>9. Reporting Concerns</h2>
    <p>If you witness or become aware of any violation of this Code:</p>
    <ul>
      <li>Report to your immediate supervisor</li>
      <li>Contact the Human Resources department</li>
      <li>Use the company's confidential reporting mechanism (if available)</li>
      <li>Escalate to senior management if other channels are ineffective</li>
    </ul>
    <p><strong>Non-Retaliation:</strong> {{company_name}} strictly prohibits retaliation against any employee who reports concerns in good faith. Anyone engaging in retaliation will be subject to disciplinary action.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understand the {{company_name}} Code of Conduct</li>
      <li>I agree to comply with all provisions set forth in this Code</li>
      <li>I understand that violation of this Code may result in disciplinary action, up to and including termination of employment</li>
      <li>I will seek clarification from HR or my supervisor if I have any questions about this Code</li>
      <li>I will report any violations of this Code that I witness or become aware of</li>
    </ul>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>Employee Signature</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>{{position}} • {{department}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This policy document was digitally signed and is legally binding. A copy will be retained in your personnel file.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "company_initial", label: "Company Initial", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "gift_threshold", label: "Gift Threshold (SLE)", type: "number", default: "500000" }
    ]
  },

  privacy_policy: {
    name: "Employee Privacy Policy Acknowledgment",
    content: `
<div class="sl-document">
  <div class="sl-watermark">CONFIDENTIAL</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">🔐</div>
    <h1>Employee Data Privacy Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Data Protection & Privacy Notice</p>
    <p class="sl-ref-number">Ref: DPP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Introduction & Purpose</h2>
    <p><strong>{{company_name}}</strong> ("the Company", "we", "us", "our") is committed to protecting the privacy and personal data of all employees. This Privacy Policy explains how we collect, use, store, share, and protect your personal information in the course of your employment.</p>
    <p>This policy has been developed in accordance with best practices for data protection and the principles of fair information handling. We treat your personal data with the utmost care and confidentiality, recognizing that privacy is a fundamental right.</p>
    <p><strong>Data Controller:</strong> {{company_name}}<br/>
    <strong>Contact:</strong> Human Resources Department, {{company_address}}<br/>
    <strong>Email:</strong> {{company_email}}</p>
  </div>

  <div class="sl-section">
    <h2>2. Legal Basis for Processing</h2>
    <p>We process your personal data based on the following legal grounds:</p>
    <ul>
      <li><strong>Contractual Necessity:</strong> To fulfill our obligations under your employment contract, including payment of salary, provision of benefits, and management of your employment relationship</li>
      <li><strong>Legal Obligation:</strong> To comply with statutory requirements including the Employment Act 2023, NASSIT regulations, NRA tax requirements, and other applicable laws of Sierra Leone</li>
      <li><strong>Legitimate Interests:</strong> To effectively manage our workforce, ensure workplace safety, protect company assets, and maintain business operations</li>
      <li><strong>Consent:</strong> For certain specific purposes where we have obtained your explicit consent, which you may withdraw at any time</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Categories of Personal Data Collected</h2>
    <p>We collect and process the following categories of personal information:</p>
    
    <div class="sl-highlight-box">
      <h3>📋 Identity & Contact Information</h3>
      <ul>
        <li>Full legal name, date of birth, gender, nationality, marital status</li>
        <li>National ID number, passport number, driver's license number</li>
        <li>Residential address, postal address, email address</li>
        <li>Personal and work telephone numbers</li>
        <li>Emergency contact details (name, relationship, phone number)</li>
        <li>Photograph for identification purposes</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="margin-top: 15px;">
      <h3>💼 Employment Information</h3>
      <ul>
        <li>Employee ID, job title, department, reporting structure</li>
        <li>Employment contract, offer letters, and related documents</li>
        <li>Work history, educational qualifications, professional certifications</li>
        <li>Skills, training records, and professional development history</li>
        <li>Performance reviews, appraisals, and feedback</li>
        <li>Disciplinary records, grievances, and related correspondence</li>
        <li>Attendance records, working hours, leave history</li>
        <li>Work location and travel records</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="margin-top: 15px;">
      <h3>💰 Financial & Compensation Data</h3>
      <ul>
        <li>Salary, wages, bonuses, commissions, and allowances</li>
        <li>Bank account details for salary payments</li>
        <li>Tax Identification Number (TIN) and PAYE records</li>
        <li>NASSIT registration number and contribution history</li>
        <li>Deductions, loans, and advances</li>
        <li>Pension and benefit entitlements</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="margin-top: 15px;">
      <h3>🏥 Sensitive Personal Data (Special Categories)</h3>
      <ul>
        <li>Medical records, health assessments, and fitness-to-work certificates</li>
        <li>Sick leave records and medical certificates</li>
        <li>Disability information for workplace accommodations</li>
        <li>Biometric data (fingerprints, facial recognition) for attendance systems where applicable</li>
        <li>Background check results (criminal record checks where legally required)</li>
      </ul>
      <p style="font-size: 12px; color: #666;"><em>Sensitive data is processed only when necessary and with appropriate safeguards.</em></p>
    </div>
  </div>

  <div class="sl-section">
    <h2>4. How We Use Your Personal Data</h2>
    <p>Your personal data is used for the following purposes:</p>
    
    <p><strong>Employment Administration:</strong></p>
    <ul>
      <li>Recruiting, onboarding, and managing your employment throughout its lifecycle</li>
      <li>Verifying your identity and right to work in Sierra Leone</li>
      <li>Maintaining accurate employee records and personnel files</li>
      <li>Managing workplace allocation, equipment, and access controls</li>
    </ul>

    <p><strong>Compensation & Benefits:</strong></p>
    <ul>
      <li>Processing payroll, calculating and paying your salary and benefits</li>
      <li>Administering statutory deductions (NASSIT, PAYE taxes)</li>
      <li>Managing employee benefits including insurance, allowances, and leave entitlements</li>
      <li>Processing expense claims and reimbursements</li>
    </ul>

    <p><strong>Performance & Development:</strong></p>
    <ul>
      <li>Conducting performance reviews, appraisals, and providing feedback</li>
      <li>Identifying training needs and managing professional development</li>
      <li>Making decisions regarding promotions, transfers, and assignments</li>
      <li>Talent management and succession planning</li>
    </ul>

    <p><strong>Legal & Regulatory Compliance:</strong></p>
    <ul>
      <li>Complying with the Employment Act 2023 and labor regulations</li>
      <li>Fulfilling tax reporting obligations to the National Revenue Authority</li>
      <li>Submitting statutory contributions to NASSIT</li>
      <li>Responding to legal requests from courts or regulatory authorities</li>
    </ul>

    <p><strong>Business Operations & Safety:</strong></p>
    <ul>
      <li>Ensuring workplace health and safety</li>
      <li>Investigating accidents, incidents, and grievances</li>
      <li>Protecting company assets and preventing fraud</li>
      <li>Business planning, reporting, and analytics (using anonymized data where possible)</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Data Sharing & Disclosure</h2>
    <p>We may share your personal data with the following categories of recipients:</p>
    
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Government Bodies</label>
        <span>NASSIT, NRA, Labour Ministry, Courts</span>
      </div>
      <div class="sl-info-item">
        <label>Financial Institutions</label>
        <span>Banks for salary processing</span>
      </div>
      <div class="sl-info-item">
        <label>Insurance Providers</label>
        <span>Health & life insurance administrators</span>
      </div>
      <div class="sl-info-item">
        <label>Service Providers</label>
        <span>Payroll, IT, HR systems providers</span>
      </div>
    </div>

    <p style="margin-top: 15px;"><strong>We will NOT:</strong></p>
    <ul>
      <li>Sell your personal data to third parties</li>
      <li>Share your data with unauthorized parties</li>
      <li>Transfer your data outside Sierra Leone without appropriate safeguards</li>
      <li>Use your data for purposes unrelated to your employment without consent</li>
    </ul>

    <p>All third-party service providers are contractually obligated to protect your data and use it only for the specified purposes.</p>
  </div>

  <div class="sl-section">
    <h2>6. Data Security Measures</h2>
    <p>We implement comprehensive security measures to protect your personal data:</p>
    
    <p><strong>Technical Safeguards:</strong></p>
    <ul>
      <li>Encrypted storage for sensitive data and secure transmission protocols</li>
      <li>Access controls with role-based permissions and strong authentication</li>
      <li>Regular security updates, patches, and vulnerability assessments</li>
      <li>Firewalls, antivirus protection, and intrusion detection systems</li>
      <li>Automated backups and disaster recovery procedures</li>
    </ul>

    <p><strong>Organizational Safeguards:</strong></p>
    <ul>
      <li>Access to personal data limited to authorized personnel on a need-to-know basis</li>
      <li>Mandatory data protection training for all staff handling personal data</li>
      <li>Confidentiality agreements with employees and contractors</li>
      <li>Due diligence and contractual obligations for third-party processors</li>
      <li>Regular audits and reviews of data handling practices</li>
    </ul>

    <p><strong>Physical Safeguards:</strong></p>
    <ul>
      <li>Secure storage for paper records with controlled access</li>
      <li>Secure disposal of documents through shredding</li>
      <li>Visitor controls and access restrictions to sensitive areas</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Your Rights</h2>
    <p>As an employee, you have the following rights regarding your personal data:</p>
    <ul>
      <li><strong>Right of Access:</strong> Request a copy of the personal data we hold about you</li>
      <li><strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete data</li>
      <li><strong>Right to Information:</strong> Receive clear information about how your data is processed</li>
      <li><strong>Right to Object:</strong> Object to processing in certain circumstances</li>
      <li><strong>Right to Withdraw Consent:</strong> Withdraw consent where processing is based on consent (without affecting prior processing)</li>
      <li><strong>Right to Lodge Complaints:</strong> Raise concerns with the HR department or relevant authorities</li>
    </ul>
    <p>To exercise any of these rights, please contact the Human Resources department in writing. We will respond within {{response_days}} working days.</p>
  </div>

  <div class="sl-section">
    <h2>8. Data Retention</h2>
    <p>We retain your personal data according to the following schedule:</p>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Employment Records</label>
        <span>Duration of employment + 7 years</span>
      </div>
      <div class="sl-info-item">
        <label>Payroll & Tax Records</label>
        <span>7 years (per NRA requirements)</span>
      </div>
      <div class="sl-info-item">
        <label>NASSIT Records</label>
        <span>Permanently (statutory requirement)</span>
      </div>
      <div class="sl-info-item">
        <label>Health & Safety Records</label>
        <span>40 years for accident records</span>
      </div>
    </div>
    <p style="margin-top: 15px;">After the retention period expires, data will be securely deleted or anonymized. Some records may be retained longer if required for legal proceedings or regulatory purposes.</p>
  </div>

  <div class="sl-section">
    <h2>9. Monitoring & Surveillance</h2>
    <p>{{company_name}} may conduct workplace monitoring for legitimate business purposes:</p>
    <ul>
      <li><strong>CCTV:</strong> For security, safety, and theft prevention in common areas</li>
      <li><strong>IT Systems:</strong> Company email, internet usage, and computer activity may be monitored</li>
      <li><strong>Attendance:</strong> Biometric or electronic time recording systems</li>
      <li><strong>Vehicle Tracking:</strong> GPS tracking on company vehicles for safety and efficiency</li>
    </ul>
    <p>Monitoring is conducted proportionately and in accordance with applicable laws. Employees should have no expectation of privacy when using company systems or facilities.</p>
  </div>

  <div class="sl-section">
    <h2>10. Policy Updates</h2>
    <p>This Privacy Policy may be updated periodically to reflect changes in our practices or legal requirements. Significant changes will be communicated to all employees. The current version is always available from the HR department.</p>
    <p><strong>Policy Version:</strong> {{policy_version}}<br/>
    <strong>Last Updated:</strong> {{effective_date}}</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment & Consent</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and understood this Employee Privacy Policy</li>
      <li>I understand what personal data is collected and how it is used</li>
      <li>I consent to the collection, processing, and sharing of my personal data as described in this policy for employment-related purposes</li>
      <li>I understand my rights regarding my personal data and how to exercise them</li>
      <li>I agree to keep my personal information current and notify HR of any changes</li>
    </ul>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>Employee Signature</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>{{position}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This acknowledgment will be stored in your personnel file. A copy is available upon request.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "company_address", label: "Company Address", type: "text", auto_fill: "organisation.address", default: "Freetown, Sierra Leone" },
      { key: "company_email", label: "Company Email", type: "text", auto_fill: "organisation.email", default: "hr@company.com" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "response_days", label: "Response Days", type: "select", options: ["14", "21", "30"], default: "14" },
      { key: "policy_version", label: "Policy Version", type: "text", default: "1.0" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" }
    ]
  },

  health_safety_policy: {
    name: "Health & Safety Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">SAFETY FIRST</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #059669 0%, #047857 100%);">⚕️</div>
    <h1>Health and Safety Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Workplace Safety Guidelines</p>
    <p class="sl-ref-number">Ref: HSP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Policy Statement & Commitment</h2>
    <p><strong>{{company_name}}</strong> is fully committed to ensuring the health, safety, and welfare of all employees, contractors, visitors, and any other persons who may be affected by our work activities. We recognize that a safe and healthy workplace is fundamental to our success and the well-being of our people.</p>
    <p>This policy is developed in accordance with the Factories Act, the Employment Act 2023 of Sierra Leone, and international best practices for occupational health and safety. We are committed to continuous improvement in our health and safety performance.</p>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #059669;">
      <h3 style="color: #059669;">🎯 Our Safety Goals</h3>
      <ul>
        <li>Zero workplace fatalities</li>
        <li>Continuous reduction in workplace injuries and illnesses</li>
        <li>Full compliance with all health and safety regulations</li>
        <li>A safety-first culture embedded at all levels of the organization</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>2. Scope & Application</h2>
    <p>This policy applies to:</p>
    <ul>
      <li>All employees of {{company_name}}, regardless of position or employment type</li>
      <li>Contractors, subcontractors, and their workers while on our premises</li>
      <li>Visitors, customers, and members of the public in our workplace</li>
      <li>All company locations, vehicles, and work sites</li>
      <li>Remote workers performing duties on behalf of the company</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Management Responsibilities</h2>
    <p><strong>{{company_name}}</strong> management commits to:</p>
    <ul>
      <li><strong>Safe Workplace:</strong> Provide and maintain a workplace, plant, equipment, and systems of work that are safe and without risks to health</li>
      <li><strong>Risk Management:</strong> Conduct regular risk assessments to identify, evaluate, and control workplace hazards</li>
      <li><strong>Safe Substances:</strong> Ensure the safe use, handling, storage, and transport of articles and substances</li>
      <li><strong>Information & Training:</strong> Provide adequate information, instruction, training, and supervision to ensure employee safety</li>
      <li><strong>Personal Protective Equipment:</strong> Provide appropriate PPE free of charge and ensure its proper use</li>
      <li><strong>Emergency Preparedness:</strong> Develop, maintain, and regularly test emergency response procedures</li>
      <li><strong>Accident Investigation:</strong> Investigate all accidents, incidents, and near-misses to prevent recurrence</li>
      <li><strong>Consultation:</strong> Consult with employees on health and safety matters and consider their input</li>
      <li><strong>Resources:</strong> Allocate adequate resources for implementing this policy effectively</li>
      <li><strong>Review:</strong> Regularly review and update this policy and safety procedures</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Employee Responsibilities</h2>
    <p>Every employee has a duty to:</p>
    <ul>
      <li><strong>Take Reasonable Care:</strong> Protect your own health and safety and that of others who may be affected by your actions or omissions</li>
      <li><strong>Follow Procedures:</strong> Comply with all safety rules, policies, procedures, and instructions</li>
      <li><strong>Use Equipment Properly:</strong> Use machinery, equipment, vehicles, and substances in accordance with training and instructions</li>
      <li><strong>Wear PPE:</strong> Wear and properly maintain all required personal protective equipment</li>
      <li><strong>Report Hazards:</strong> Report any unsafe conditions, equipment defects, or safety concerns immediately to your supervisor</li>
      <li><strong>Report Incidents:</strong> Report all accidents, injuries, illnesses, and near-misses promptly, no matter how minor</li>
      <li><strong>Attend Training:</strong> Participate actively in all required health and safety training programs</li>
      <li><strong>No Interference:</strong> Do not intentionally interfere with or misuse anything provided for health and safety</li>
      <li><strong>Stay Fit for Work:</strong> Do not work while impaired by alcohol, drugs, fatigue, or illness that could endanger yourself or others</li>
      <li><strong>Maintain Cleanliness:</strong> Keep work areas clean, tidy, and free from obstruction</li>
      <li><strong>Cooperate:</strong> Cooperate with management on all health and safety matters</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Hazard Identification & Risk Assessment</h2>
    <p>We are committed to proactive hazard management:</p>
    <ul>
      <li><strong>Regular Inspections:</strong> Workplace safety inspections conducted {{inspection_frequency}}</li>
      <li><strong>Risk Assessments:</strong> Formal risk assessments for all work activities, equipment, and substances</li>
      <li><strong>Control Measures:</strong> Implementation of the hierarchy of controls—elimination, substitution, engineering controls, administrative controls, and PPE</li>
      <li><strong>Review:</strong> Risk assessments reviewed annually and after any incident, change in process, or new hazard identification</li>
      <li><strong>Documentation:</strong> All assessments and control measures documented and accessible to employees</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Personal Protective Equipment (PPE)</h2>
    <p>Where hazards cannot be eliminated or adequately controlled by other means:</p>
    <ul>
      <li>Appropriate PPE will be provided free of charge to all employees who require it</li>
      <li>Training will be provided on the correct use, maintenance, and storage of PPE</li>
      <li>Employees must wear PPE as directed and report any damage or defects immediately</li>
      <li>PPE will be replaced when worn, damaged, or at recommended intervals</li>
      <li>Types of PPE include: {{ppe_types}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Emergency Procedures</h2>
    <div class="sl-highlight-box" style="background: #fef2f2; border-color: #dc2626;">
      <h3 style="color: #dc2626;">🚨 Emergency Contacts - Sierra Leone</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Police</label>
          <span>019</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Fire Service</label>
          <span>020</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Ambulance</label>
          <span>022</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Emergency Coordinator</label>
          <span>{{emergency_coordinator}}</span>
        </div>
      </div>
    </div>

    <p style="margin-top: 15px;"><strong>In Case of Fire:</strong></p>
    <ol>
      <li>Activate the nearest fire alarm if not already sounding</li>
      <li>Alert others in your immediate area</li>
      <li>If safe to do so, attempt to extinguish small fires using appropriate equipment</li>
      <li>Evacuate immediately using the nearest safe exit—do NOT use elevators</li>
      <li>Proceed calmly to the designated assembly point: <strong>{{assembly_point}}</strong></li>
      <li>Do not re-enter the building until given the all-clear by emergency services or designated personnel</li>
    </ol>

    <p><strong>In Case of Medical Emergency:</strong></p>
    <ol>
      <li>Call for help and alert the nearest trained first aider</li>
      <li>Do not move injured persons unless there is immediate danger</li>
      <li>Administer first aid only if trained to do so</li>
      <li>Call emergency services if needed</li>
      <li>Stay with the injured person until help arrives</li>
      <li>Report the incident to your supervisor as soon as possible</li>
    </ol>

    <p><strong>Evacuation Procedures:</strong></p>
    <ul>
      <li>Know the location of emergency exits—they are marked with green signs</li>
      <li>Know your evacuation route and alternative routes</li>
      <li>Participate in regular fire drills (conducted {{drill_frequency}})</li>
      <li>Assist persons with disabilities if trained to do so</li>
      <li>Do not stop to collect personal belongings</li>
      <li>Close doors behind you if safe to do so</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. First Aid Provisions</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>First Aid Kit Locations</label>
        <span>{{first_aid_locations}}</span>
      </div>
      <div class="sl-info-item">
        <label>Number of First Aiders</label>
        <span>{{first_aiders_count}}</span>
      </div>
    </div>
    <p style="margin-top: 15px;">First aid kits are checked {{first_aid_check_frequency}} and restocked as needed. A list of trained first aiders with their contact details is posted near each first aid station. First aiders undergo refresher training every {{first_aid_training_frequency}}.</p>
  </div>

  <div class="sl-section">
    <h2>9. Accident & Incident Reporting</h2>
    <p>All workplace accidents, injuries, occupational illnesses, near-misses, and dangerous occurrences must be reported:</p>
    <ul>
      <li><strong>Immediate Reporting:</strong> Report all incidents to your supervisor immediately, no matter how minor</li>
      <li><strong>Accident Book:</strong> Complete an entry in the official accident book within 24 hours</li>
      <li><strong>Investigation:</strong> All incidents will be investigated to identify root causes and prevent recurrence</li>
      <li><strong>Statutory Reporting:</strong> Serious injuries, fatalities, and dangerous occurrences will be reported to the Labour Inspectorate and other relevant authorities as required by law</li>
      <li><strong>Records:</strong> Accident records are maintained for a minimum of 40 years</li>
    </ul>
    <p><strong>What Must Be Reported:</strong></p>
    <ul>
      <li>Any injury requiring first aid treatment or medical attention</li>
      <li>Any near-miss that could have resulted in injury or damage</li>
      <li>Any dangerous occurrence, equipment failure, or structural damage</li>
      <li>Any occupational illness or disease</li>
      <li>Any fire or explosion, however small</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Health & Wellbeing</h2>
    <p>{{company_name}} supports employee health and wellbeing through:</p>
    <ul>
      <li><strong>Occupational Health:</strong> Pre-employment and periodic health assessments where appropriate</li>
      <li><strong>Ergonomics:</strong> Workstation assessments and adjustments to prevent musculoskeletal disorders</li>
      <li><strong>Mental Health:</strong> Support for employees experiencing stress, anxiety, or mental health challenges</li>
      <li><strong>Clean Facilities:</strong> Provision of clean drinking water, sanitary facilities, and welfare amenities</li>
      <li><strong>Working Environment:</strong> Adequate lighting, ventilation, and temperature control</li>
      <li><strong>Work-Life Balance:</strong> Reasonable working hours and breaks in accordance with the Employment Act 2023</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Specific Hazards & Controls</h2>
    <p><strong>Fire Safety:</strong></p>
    <ul>
      <li>Fire extinguishers inspected {{fire_extinguisher_check}} and serviced annually</li>
      <li>No blocking of fire exits, escape routes, or fire equipment</li>
      <li>Smoking prohibited except in designated areas</li>
      <li>Flammable materials stored correctly in approved containers</li>
    </ul>

    <p><strong>Electrical Safety:</strong></p>
    <ul>
      <li>All electrical installations maintained by qualified electricians</li>
      <li>Portable appliance testing (PAT) conducted regularly</li>
      <li>Report frayed cables, damaged plugs, or electrical faults immediately</li>
      <li>Do not overload electrical outlets</li>
    </ul>

    <p><strong>Manual Handling:</strong></p>
    <ul>
      <li>Training provided for employees required to lift or carry loads</li>
      <li>Use mechanical aids where available</li>
      <li>Do not lift loads exceeding your capability—ask for assistance</li>
    </ul>

    <p><strong>Hazardous Substances:</strong></p>
    <ul>
      <li>Material Safety Data Sheets (MSDS) available for all chemicals</li>
      <li>Proper labeling, storage, and disposal of hazardous materials</li>
      <li>Training provided before handling any hazardous substances</li>
      <li>Appropriate PPE required when handling chemicals</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Training & Competence</h2>
    <p>Health and safety training is provided:</p>
    <ul>
      <li><strong>Induction Training:</strong> All new employees receive safety induction before starting work</li>
      <li><strong>Job-Specific Training:</strong> Training for specific hazards and equipment related to your role</li>
      <li><strong>Refresher Training:</strong> Regular updates and refresher courses</li>
      <li><strong>First Aid Training:</strong> Adequate number of employees trained as first aiders</li>
      <li><strong>Fire Warden Training:</strong> Designated fire wardens trained for each area</li>
      <li><strong>Management Training:</strong> Supervisors and managers trained in their safety responsibilities</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>13. Disciplinary Action</h2>
    <p>Violations of health and safety rules are taken seriously and may result in disciplinary action:</p>
    <ul>
      <li>Failure to follow safety procedures or wear required PPE</li>
      <li>Failure to report hazards, accidents, or incidents</li>
      <li>Removing or interfering with safety equipment or guards</li>
      <li>Working while impaired by alcohol or drugs</li>
      <li>Reckless behavior that endangers self or others</li>
    </ul>
    <p>Serious violations may result in immediate dismissal in accordance with the company's Disciplinary Policy and Section 91 of the Employment Act 2023.</p>
  </div>

  <div class="sl-section">
    <h2>14. Policy Review</h2>
    <p>This Health and Safety Policy will be reviewed {{review_frequency}} or sooner if:</p>
    <ul>
      <li>There are significant changes in legislation or best practices</li>
      <li>Following any serious accident or incident</li>
      <li>Following changes to work activities, processes, or premises</li>
      <li>When risk assessments indicate a need for review</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understand this Health and Safety Policy</li>
      <li>I understand my responsibilities for my own safety and that of others</li>
      <li>I agree to comply with all health and safety rules, procedures, and instructions</li>
      <li>I will report any hazards, unsafe conditions, or incidents immediately</li>
      <li>I understand that failure to comply may result in disciplinary action</li>
      <li>I know the location of emergency exits, first aid facilities, and assembly points</li>
    </ul>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>Employee Signature</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>{{position}} • {{department}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This policy complies with the Factories Act and Employment Act 2023 of Sierra Leone. Safety is everyone's responsibility.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "inspection_frequency", label: "Inspection Frequency", type: "select", options: ["weekly", "monthly", "quarterly"], default: "monthly" },
      { key: "ppe_types", label: "PPE Types Used", type: "text", default: "safety helmets, high-visibility vests, safety boots, gloves, eye protection, hearing protection as required" },
      { key: "emergency_coordinator", label: "Emergency Coordinator Contact", type: "text", default: "Safety Officer" },
      { key: "assembly_point", label: "Assembly Point", type: "text", default: "Main car park" },
      { key: "drill_frequency", label: "Drill Frequency", type: "select", options: ["monthly", "quarterly", "bi-annually"], default: "quarterly" },
      { key: "first_aid_locations", label: "First Aid Kit Locations", type: "text", default: "Reception, each floor, kitchen, warehouse" },
      { key: "first_aiders_count", label: "Number of First Aiders", type: "text", default: "Minimum 1 per 50 employees" },
      { key: "first_aid_check_frequency", label: "First Aid Check Frequency", type: "select", options: ["weekly", "monthly"], default: "monthly" },
      { key: "first_aid_training_frequency", label: "First Aider Training Renewal", type: "select", options: ["annually", "every 2 years", "every 3 years"], default: "every 3 years" },
      { key: "fire_extinguisher_check", label: "Fire Extinguisher Check", type: "select", options: ["monthly", "quarterly"], default: "monthly" },
      { key: "review_frequency", label: "Policy Review Frequency", type: "select", options: ["annually", "every 2 years"], default: "annually" }
    ]
  },

  nda: {
    name: "Non-Disclosure Agreement",
    content: `
<div class="sl-document">
  <div class="sl-watermark">CONFIDENTIAL</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">🔒</div>
    <h1>Non-Disclosure Agreement</h1>
    <p class="sl-subtitle">Confidentiality & Non-Disclosure Agreement (NDA)</p>
    <p class="sl-ref-number">Ref: NDA-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>Agreement Parties</h2>
    <div class="sl-parties-box">
      <div class="sl-party employer">
        <h3>🏢 Disclosing Party</h3>
        <p><strong>{{company_name}}</strong></p>
        <p>("the Company")</p>
      </div>
      <div class="sl-party">
        <h3>👤 Receiving Party</h3>
        <p><strong>{{employee_name}}</strong></p>
        <p>("the Employee")</p>
      </div>
    </div>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Effective Date</label>
        <span>{{effective_date}}</span>
      </div>
      <div class="sl-info-item">
        <label>Duration After Termination</label>
        <span>{{duration_years}} years</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>1. Definition of Confidential Information</h2>
    <p>For purposes of this Agreement, "Confidential Information" includes all non-public information disclosed to or known by the Employee, including but not limited to:</p>
    <ul>
      <li>Business strategies, plans, and operational methods</li>
      <li>Financial information, projections, and pricing</li>
      <li>Customer and supplier lists, contacts, and data</li>
      <li>Product designs, formulas, specifications, and trade secrets</li>
      <li>Marketing strategies and competitive intelligence</li>
      <li>Software, source code, and technical data</li>
      <li>Employee and personnel information</li>
      <li>Any information marked or identified as confidential</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Employee Obligations</h2>
    <p>The Employee agrees to:</p>
    <ul>
      <li>Maintain strict confidentiality of all Confidential Information</li>
      <li>Not disclose Confidential Information to any third party without prior written consent</li>
      <li>Use Confidential Information solely for performing assigned job duties</li>
      <li>Take all reasonable measures to protect the confidentiality of information</li>
      <li>Return all materials containing Confidential Information upon termination</li>
      <li>Immediately notify management of any suspected breaches</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Exclusions</h2>
    <p>This Agreement does not apply to information that:</p>
    <ul>
      <li>Is or becomes publicly available through no fault of the Employee</li>
      <li>Was lawfully known to the Employee prior to disclosure</li>
      <li>Is independently developed by the Employee without use of Confidential Information</li>
      <li>Is required to be disclosed by law, regulation, or court order</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Duration & Survival</h2>
    <div class="sl-highlight-box">
      <h3>⏱️ Agreement Duration</h3>
      <p>This Agreement shall remain in full force and effect during the Employee's employment with the Company and for a period of <strong>{{duration_years}} years</strong> following the termination of employment for any reason.</p>
    </div>
  </div>

  <div class="sl-section">
    <h2>5. Remedies for Breach</h2>
    <p>The Employee acknowledges that any breach of this Agreement may cause irreparable harm to the Company for which monetary damages would be inadequate. The Company shall be entitled to seek:</p>
    <ul>
      <li>Injunctive relief to prevent further breaches</li>
      <li>Monetary damages including lost profits</li>
      <li>Legal costs and attorney fees</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Governing Law</h2>
    <p>This Agreement shall be governed by and construed in accordance with the laws of the Republic of Sierra Leone. Any disputes arising from this Agreement shall be subject to the exclusive jurisdiction of the courts of Sierra Leone.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Acknowledgment</h2>
    <p>Both parties acknowledge that they have read, understood, and agree to be bound by all terms and conditions of this Non-Disclosure Agreement.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For the Company</h4>
      <p><strong>{{company_signatory}}</strong></p>
      <p>{{company_signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
      <p style="font-size: 10px; color: #888; margin-top: 5px;">Authorized Signature</p>
    </div>
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This Non-Disclosure Agreement is legally binding under Sierra Leone law. Digital signatures are enforceable.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" },
      { key: "duration_years", label: "Duration (years)", type: "select", options: ["1", "2", "3", "5"], default: "2" },
      { key: "company_signatory", label: "Company Signatory", type: "text", default: "HR Manager" },
      { key: "company_signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  },

  anti_harassment_policy: {
    name: "Anti-Harassment Policy",
    content: `
<div class="sl-document">
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>ANTI-HARASSMENT POLICY</h1>
    <p class="sl-subtitle">{{company_name}}</p>
  </div>

  <div class="sl-section">
    <h2>1. POLICY STATEMENT</h2>
    <p>{{company_name}} is committed to providing a workplace free from harassment, discrimination, and bullying. This policy applies to all employees, contractors, customers, and visitors.</p>
    <p>This policy is in accordance with the Employment Act 2023 of Sierra Leone which prohibits discrimination based on colour, disability, political opinion, national extraction, marriage, pregnancy and maternity, race, religion or belief, sexuality, sex, membership of a trade union, organisation or social origin.</p>
  </div>

  <div class="sl-section">
    <h2>2. DEFINITION OF HARASSMENT</h2>
    <p>Harassment includes any unwelcome conduct that:</p>
    <ul>
      <li><strong>Sexual Harassment:</strong> Unwanted sexual advances, requests for sexual favors, or other verbal or physical conduct of a sexual nature</li>
      <li><strong>Bullying:</strong> Repeated unreasonable behavior directed toward an employee that creates a risk to health and safety</li>
      <li><strong>Verbal Harassment:</strong> Offensive jokes, slurs, name-calling, or threats</li>
      <li><strong>Physical Harassment:</strong> Unwanted touching, physical intimidation, or assault</li>
      <li><strong>Visual Harassment:</strong> Offensive posters, drawings, or gestures</li>
      <li><strong>Online Harassment:</strong> Cyberbullying through emails, messages, or social media</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. REPORTING PROCEDURES</h2>
    <p>If you experience or witness harassment:</p>
    <ol>
      <li>Report the incident to your supervisor, HR department, or management</li>
      <li>Provide a written statement describing the incident(s)</li>
      <li>Include names of witnesses if any</li>
      <li>All reports will be treated confidentially</li>
    </ol>
    <p>You may also report anonymously through the company's complaint system.</p>
  </div>

  <div class="sl-section">
    <h2>4. INVESTIGATION</h2>
    <p>All complaints will be:</p>
    <ul>
      <li>Investigated promptly and thoroughly</li>
      <li>Handled with appropriate confidentiality</li>
      <li>Concluded with appropriate action</li>
    </ul>
    <p>Both the complainant and accused will be informed of the outcome.</p>
  </div>

  <div class="sl-section">
    <h2>5. NO RETALIATION</h2>
    <p>Retaliation against anyone who reports harassment or participates in an investigation is strictly prohibited and will result in disciplinary action.</p>
  </div>

  <div class="sl-section">
    <h2>6. CONSEQUENCES</h2>
    <p>Employees found to have engaged in harassment may face disciplinary action up to and including termination of employment, in accordance with the Employment Act 2023.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>ACKNOWLEDGMENT</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read and understood this Anti-Harassment Policy. I agree to comply with this policy and to report any harassment I experience or witness.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <p><strong>EMPLOYEE:</strong></p>
      <p>Name: {{employee_name}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <p>{{company_name}} • 🇸🇱 Sierra Leone</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" }
    ]
  },

  leave_policy: {
    name: "Leave Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">📅</div>
    <h1>Leave Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Per Employment Act 2023 of Sierra Leone</p>
  </div>

  <div class="sl-section">
    <h2>1. Annual Leave</h2>
    <div class="sl-highlight-box">
      <h3>🏖️ Annual Leave Entitlement</h3>
      <p>Per Section 44 of the Employment Act 2023, employees are entitled to:</p>
      <div class="sl-info-grid">
        <div class="sl-info-item">
          <label>Annual Entitlement</label>
          <span>21 working days</span>
        </div>
        <div class="sl-info-item">
          <label>Monthly Accrual</label>
          <span>1.75 days/month</span>
        </div>
      </div>
    </div>
    <ul>
      <li>Leave accrues after 12 months of continuous service</li>
      <li>Leave must be taken within 12 months of accrual unless otherwise agreed</li>
      <li>Maximum 10 days carry-forward with management approval</li>
      <li>Submit leave requests at least 2 weeks in advance</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Sick Leave</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Paid Sick Days</label>
        <span>5 days per year</span>
      </div>
      <div class="sl-info-item">
        <label>Medical Certificate</label>
        <span>Required for 2+ days</span>
      </div>
    </div>
    <ul>
      <li>Notify supervisor as early as possible on the first day of illness</li>
      <li>Extended sick leave may be granted at management discretion</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Maternity Leave</h2>
    <div class="sl-highlight-box">
      <h3>👶 Maternity Leave (Section 47, Employment Act 2023)</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item">
          <label>Total Entitlement</label>
          <span>14 weeks (98 days)</span>
        </div>
        <div class="sl-info-item">
          <label>Post-Delivery Minimum</label>
          <span>6 weeks</span>
        </div>
      </div>
    </div>
    <ul>
      <li>Full pay for the first 6 weeks; subsequent weeks at 50% pay</li>
      <li>Medical certificate confirming pregnancy required</li>
      <li>Job protection during maternity leave is guaranteed by law</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Paternity Leave</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Entitlement</label>
        <span>5 working days</span>
      </div>
      <div class="sl-info-item">
        <label>Timeframe</label>
        <span>Within 2 weeks of birth</span>
      </div>
    </div>
    <p>Birth certificate required for paternity leave application.</p>
  </div>

  <div class="sl-section">
    <h2>5. Compassionate Leave</h2>
    <ul>
      <li><strong>5 working days</strong> for death of immediate family (spouse, child, parent, sibling)</li>
      <li><strong>3 working days</strong> for extended family members</li>
      <li>Additional unpaid leave may be requested for exceptional circumstances</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Public Holidays</h2>
    <p>All employees are entitled to paid leave on Sierra Leone public holidays. If required to work on a public holiday, compensation shall be at <strong>2.5x the regular rate</strong>.</p>
  </div>

  <div class="sl-section">
    <h2>7. Unpaid Leave</h2>
    <p>Unpaid leave may be granted at management discretion for personal reasons. Requests must be submitted in writing with at least 2 weeks notice.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read and understood this Leave Policy. I agree to follow the procedures outlined for requesting and taking leave.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>Employee Signature</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This policy is compliant with the Employment Act 2023 of Sierra Leone.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" }
    ]
  },

  warning_letter: {
    name: "Warning Letter",
    content: `
<div class="sl-document">
  <div class="sl-watermark">WARNING</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">⚠️</div>
    <h1>Official Warning Letter</h1>
    <p class="sl-subtitle">{{company_name}} • Disciplinary Notice</p>
    <p class="sl-ref-number">Ref: WL-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Employee Name</label>
        <span>{{employee_name}}</span>
      </div>
      <div class="sl-info-item">
        <label>Position</label>
        <span>{{position}}</span>
      </div>
      <div class="sl-info-item">
        <label>Department</label>
        <span>{{department}}</span>
      </div>
      <div class="sl-info-item">
        <label>Warning Date</label>
        <span>{{warning_date}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Warning Type</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #dc2626;">
      <h3 style="color: #dc2626;">{{warning_type}}</h3>
      <p>This is a formal {{warning_level}} warning issued in accordance with the company's Disciplinary Policy and the Employment Act 2023 of Sierra Leone.</p>
    </div>
  </div>

  <div class="sl-section">
    <h2>Details of Violation</h2>
    <p><strong>Date of Incident:</strong> {{incident_date}}</p>
    <p><strong>Description:</strong></p>
    <p>{{incident_description}}</p>
  </div>

  <div class="sl-section">
    <h2>Policy Violated</h2>
    <p>{{policy_violated}}</p>
  </div>

  <div class="sl-section">
    <h2>Required Corrective Action</h2>
    <p>{{corrective_action}}</p>
  </div>

  <div class="sl-section">
    <h2>Consequences of Further Violations</h2>
    <p>Please be advised that any further violations of company policies may result in additional disciplinary action, including but not limited to:</p>
    <ul>
      <li>Additional written warnings</li>
      <li>Suspension from duties</li>
      <li>Termination of employment</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have received this warning letter. I understand the nature of the violation and the corrective actions required. I acknowledge that further violations may result in additional disciplinary action.</p>
    <p><em>Note: Signing this letter does not necessarily indicate agreement with the content, but confirms receipt of this notice.</em></p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>Issuing Manager</h4>
      <p><strong>{{issuing_manager}}</strong></p>
      <p>{{issuing_manager_title}}</p>
      <p>Date: {{warning_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This document will be retained in the employee's personnel file.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Reference Number", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "warning_date", label: "Warning Date", type: "date", auto_fill: "today" },
      { key: "warning_type", label: "Warning Type", type: "select", options: ["Attendance", "Performance", "Conduct", "Policy Violation", "Other"], default: "Conduct" },
      { key: "warning_level", label: "Warning Level", type: "select", options: ["First", "Second", "Final"], default: "First" },
      { key: "incident_date", label: "Incident Date", type: "date" },
      { key: "incident_description", label: "Description", type: "text", default: "Employee violated company policy as detailed below." },
      { key: "policy_violated", label: "Policy Violated", type: "text", default: "Employee Code of Conduct" },
      { key: "corrective_action", label: "Corrective Action", type: "text", default: "Employee must adhere to company policies going forward." },
      { key: "issuing_manager", label: "Issuing Manager", type: "text", default: "HR Manager" },
      { key: "issuing_manager_title", label: "Manager Title", type: "text", default: "Human Resources" }
    ]
  },

  promotion_letter: {
    name: "Promotion Letter",
    content: `
<div class="sl-document">
  <div class="sl-watermark">PROMOTION</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #059669 0%, #047857 100%);">🎉</div>
    <h1>Letter of Promotion</h1>
    <p class="sl-subtitle">{{company_name}} • Career Advancement Notification</p>
    <p class="sl-ref-number">Ref: PROMO-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <p>We are pleased to inform you of your promotion within {{company_name}}. This recognition reflects your outstanding contributions, dedication, and commitment to excellence.</p>
  </div>

  <div class="sl-section">
    <h2>Promotion Details</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #059669;">
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Previous Position</label>
          <span>{{previous_position}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>New Position</label>
          <span>{{new_position}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Department</label>
          <span>{{department}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Effective Date</label>
          <span>{{effective_date}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Revised Compensation</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>New Monthly Salary</label>
        <span>SLE {{new_salary}}</span>
      </div>
      <div class="sl-info-item">
        <label>Reports To</label>
        <span>{{reports_to}}</span>
      </div>
    </div>
    <p>{{additional_benefits}}</p>
  </div>

  <div class="sl-section">
    <h2>New Responsibilities</h2>
    <p>{{new_responsibilities}}</p>
  </div>

  <div class="sl-section">
    <p>We have full confidence in your ability to excel in this new role. Your hard work and dedication have been instrumental in your growth, and we look forward to your continued success.</p>
    <p>Please sign below to acknowledge receipt of this promotion letter and acceptance of your new role.</p>
    <p>Congratulations on this well-deserved achievement!</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Acceptance</h2>
    <p>I, <strong>{{employee_name}}</strong>, accept this promotion and acknowledge the new terms and responsibilities outlined in this letter.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For the Company</h4>
      <p><strong>{{authorized_signatory}}</strong></p>
      <p>{{signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This letter forms part of your employment record.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Reference Number", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "previous_position", label: "Previous Position", type: "text", auto_fill: "employee.position" },
      { key: "new_position", label: "New Position", type: "text" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" },
      { key: "new_salary", label: "New Salary (SLE)", type: "number" },
      { key: "reports_to", label: "Reports To", type: "text", default: "Line Manager" },
      { key: "additional_benefits", label: "Additional Benefits", type: "text", default: "As per company policy" },
      { key: "new_responsibilities", label: "New Responsibilities", type: "text", default: "As per new role requirements" },
      { key: "authorized_signatory", label: "Authorized Signatory", type: "text", default: "HR Manager" },
      { key: "signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  },

  salary_revision: {
    name: "Salary Revision Letter",
    content: `
<div class="sl-document">
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">💰</div>
    <h1>Salary Revision Letter</h1>
    <p class="sl-subtitle">{{company_name}} • Compensation Adjustment</p>
    <p class="sl-ref-number">Ref: SAL-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <p>We are pleased to inform you of an adjustment to your compensation package, effective <strong>{{effective_date}}</strong>.</p>
  </div>

  <div class="sl-section">
    <h2>Salary Adjustment Details</h2>
    <div class="sl-highlight-box">
      <div class="sl-info-grid">
        <div class="sl-info-item">
          <label>Previous Salary</label>
          <span>SLE {{previous_salary}}</span>
        </div>
        <div class="sl-info-item">
          <label>New Salary</label>
          <span>SLE {{new_salary}}</span>
        </div>
        <div class="sl-info-item">
          <label>Adjustment</label>
          <span>{{adjustment_percentage}}%</span>
        </div>
        <div class="sl-info-item">
          <label>Effective Date</label>
          <span>{{effective_date}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Reason for Adjustment</h2>
    <p>{{adjustment_reason}}</p>
  </div>

  <div class="sl-section">
    <p>This adjustment reflects our appreciation for your contributions to {{company_name}}. We value your continued dedication and look forward to your ongoing success with the organization.</p>
    <p>All other terms and conditions of your employment remain unchanged. Statutory deductions (NASSIT and PAYE) will be adjusted accordingly per Sierra Leone law.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge receipt of this salary revision letter and accept the new compensation terms effective {{effective_date}}.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For the Company</h4>
      <p><strong>{{authorized_signatory}}</strong></p>
      <p>{{signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This letter is confidential and forms part of your employment record.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Reference Number", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "previous_salary", label: "Previous Salary (SLE)", type: "number", auto_fill: "employee.base_salary" },
      { key: "new_salary", label: "New Salary (SLE)", type: "number" },
      { key: "adjustment_percentage", label: "Adjustment %", type: "number", default: "10" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" },
      { key: "adjustment_reason", label: "Reason", type: "select", options: ["Annual Review", "Performance Based", "Market Adjustment", "Promotion", "Cost of Living Adjustment", "Other"], default: "Annual Review" },
      { key: "authorized_signatory", label: "Authorized Signatory", type: "text", default: "HR Manager" },
      { key: "signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  },

  it_acceptable_use: {
    name: "IT Acceptable Use Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">IT POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">💻</div>
    <h1>IT Acceptable Use Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Information Technology Guidelines</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose</h2>
    <p>This policy outlines the acceptable use of {{company_name}}'s information technology resources. All employees are responsible for using company IT resources in a professional, ethical, and lawful manner.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope</h2>
    <p>This policy applies to:</p>
    <ul>
      <li>All company-provided computers, laptops, tablets, and mobile devices</li>
      <li>Company email systems and accounts</li>
      <li>Internet access through company networks</li>
      <li>Company software and applications</li>
      <li>Company data and information systems</li>
      <li>Personal devices used for work purposes (BYOD)</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Acceptable Use</h2>
    <p>Employees may use IT resources for:</p>
    <ul>
      <li>Performing assigned job duties and responsibilities</li>
      <li>Professional development and training activities</li>
      <li>Limited personal use that does not interfere with work</li>
      <li>Authorized communications with clients and stakeholders</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Prohibited Activities</h2>
    <p>The following activities are strictly prohibited:</p>
    <ul>
      <li>Accessing, downloading, or sharing pornographic, offensive, or illegal content</li>
      <li>Installing unauthorized software or applications</li>
      <li>Sharing passwords or login credentials with others</li>
      <li>Attempting to bypass security controls or access restricted systems</li>
      <li>Using company resources for personal business or commercial activities</li>
      <li>Downloading or distributing copyrighted materials illegally</li>
      <li>Sending spam, chain letters, or malicious content</li>
      <li>Using company systems to harass, threaten, or defame others</li>
      <li>Connecting unauthorized devices to company networks</li>
      <li>Disclosing confidential information through unsecured channels</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Email & Communications</h2>
    <ul>
      <li>Use professional language in all business communications</li>
      <li>Do not open suspicious emails or attachments</li>
      <li>Report phishing attempts to IT department immediately</li>
      <li>Company email is company property and may be monitored</li>
      <li>Do not auto-forward company emails to personal accounts</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Password & Security</h2>
    <ul>
      <li>Create strong passwords (minimum 8 characters, mix of letters, numbers, symbols)</li>
      <li>Change passwords every {{password_change_days}} days</li>
      <li>Never share your password with anyone</li>
      <li>Lock your computer when away from your desk</li>
      <li>Report lost or stolen devices immediately</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Data Protection</h2>
    <ul>
      <li>Store sensitive data only on approved company systems</li>
      <li>Do not save company data on personal devices without authorization</li>
      <li>Use encryption when transferring sensitive information</li>
      <li>Follow data backup procedures as directed</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Social Media</h2>
    <ul>
      <li>Do not share confidential company information on social media</li>
      <li>Clearly state that personal opinions are your own</li>
      <li>Do not use company branding without authorization</li>
      <li>Be professional when representing the company online</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Monitoring</h2>
    <p>{{company_name}} reserves the right to monitor all use of company IT resources to ensure compliance with this policy. This may include:</p>
    <ul>
      <li>Email and internet usage monitoring</li>
      <li>Access logs and system activity</li>
      <li>Security scans and audits</li>
    </ul>
    <p>Employees should have no expectation of privacy when using company IT resources.</p>
  </div>

  <div class="sl-section">
    <h2>10. Consequences of Violations</h2>
    <p>Violations of this policy may result in:</p>
    <ul>
      <li>Verbal or written warnings</li>
      <li>Suspension or restriction of IT access</li>
      <li>Disciplinary action up to and including termination</li>
      <li>Legal action in cases of criminal activity</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read, understood, and agree to comply with this IT Acceptable Use Policy. I understand that violation of this policy may result in disciplinary action.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>Employee Signature</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "password_change_days", label: "Password Change (Days)", type: "select", options: ["30", "60", "90"], default: "90" }
    ]
  },

  disciplinary_policy: {
    name: "Disciplinary Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);">⚖️</div>
    <h1>Disciplinary Policy & Procedures</h1>
    <p class="sl-subtitle">{{company_name}} • In accordance with Employment Act 2023</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose</h2>
    <p>This policy establishes fair and consistent procedures for addressing employee misconduct and performance issues. It is designed to comply with the Employment Act 2023 of Sierra Leone and ensure all employees are treated fairly.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope</h2>
    <p>This policy applies to all employees of {{company_name}} regardless of position, tenure, or employment type.</p>
  </div>

  <div class="sl-section">
    <h2>3. Types of Misconduct</h2>
    <div class="sl-highlight-box" style="background: #fef2f2; border-color: #dc2626;">
      <h3 style="color: #dc2626;">3.1 Minor Misconduct</h3>
      <ul>
        <li>Lateness or poor timekeeping</li>
        <li>Unauthorized absence for short periods</li>
        <li>Minor breach of company rules</li>
        <li>Poor work performance</li>
        <li>Inappropriate dress or behavior</li>
      </ul>
    </div>
    <div class="sl-highlight-box" style="background: #fef2f2; border-color: #b91c1c; margin-top: 15px;">
      <h3 style="color: #b91c1c;">3.2 Gross Misconduct (Per Section 91, Employment Act 2023)</h3>
      <ul>
        <li>Theft, fraud, or dishonesty</li>
        <li>Physical violence or threats</li>
        <li>Serious insubordination</li>
        <li>Harassment or discrimination</li>
        <li>Deliberate damage to company property</li>
        <li>Being under the influence of alcohol/drugs at work</li>
        <li>Serious breach of health and safety rules</li>
        <li>Breach of confidentiality</li>
        <li>Criminal conduct affecting employment</li>
        <li>Falsification of records or documents</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>4. Disciplinary Stages</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item" style="border-left-color: #fbbf24;">
        <label>Stage 1</label>
        <span>Verbal Warning</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #f97316;">
        <label>Stage 2</label>
        <span>First Written Warning</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #ef4444;">
        <label>Stage 3</label>
        <span>Final Written Warning</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #b91c1c;">
        <label>Stage 4</label>
        <span>Dismissal</span>
      </div>
    </div>
    <p>The stage of disciplinary action depends on the severity of the misconduct. Gross misconduct may result in immediate dismissal without prior warnings, as permitted under Section 91 of the Employment Act 2023.</p>
  </div>

  <div class="sl-section">
    <h2>5. Disciplinary Procedure</h2>
    <ol>
      <li><strong>Investigation:</strong> All allegations will be investigated thoroughly before any action is taken</li>
      <li><strong>Notice:</strong> Employee will be informed in writing of the allegations at least 48 hours before any hearing</li>
      <li><strong>Hearing:</strong> Employee will have the opportunity to present their case and be accompanied by a colleague or union representative</li>
      <li><strong>Decision:</strong> A decision will be communicated within 5 working days of the hearing</li>
      <li><strong>Right to Appeal:</strong> Employee has 7 working days to appeal any disciplinary decision</li>
    </ol>
  </div>

  <div class="sl-section">
    <h2>6. Suspension</h2>
    <p>In cases of alleged gross misconduct, an employee may be suspended with full pay while an investigation is conducted. Suspension is not a disciplinary action and does not prejudice the outcome of the investigation.</p>
  </div>

  <div class="sl-section">
    <h2>7. Warning Validity</h2>
    <ul>
      <li>Verbal warnings remain on file for 6 months</li>
      <li>First written warnings remain on file for 12 months</li>
      <li>Final written warnings remain on file for 24 months</li>
    </ul>
    <p>After these periods, warnings are considered spent and will not be taken into account for future disciplinary matters unless there is a pattern of similar behavior.</p>
  </div>

  <div class="sl-section">
    <h2>8. Appeal Process</h2>
    <p>Employees have the right to appeal any disciplinary action by submitting a written appeal to the {{appeal_authority}} within 7 working days of receiving the decision. The appeal will be heard by a manager not previously involved in the case.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read and understood this Disciplinary Policy. I understand the procedures that will be followed if disciplinary action is required and my rights under this policy.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>Employee Signature</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This policy complies with the Employment Act 2023 of Sierra Leone.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "appeal_authority", label: "Appeal Authority", type: "text", default: "Managing Director" }
    ]
  },

  remote_work_policy: {
    name: "Remote Work Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">🏠</div>
    <h1>Remote Work Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Work From Home Guidelines</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose</h2>
    <p>This policy outlines the terms and conditions for remote work arrangements at {{company_name}}. It aims to provide flexibility while maintaining productivity, communication, and professional standards.</p>
  </div>

  <div class="sl-section">
    <h2>2. Eligibility</h2>
    <p>Remote work may be granted to employees who:</p>
    <ul>
      <li>Have completed their probationary period</li>
      <li>Demonstrate strong self-management and organizational skills</li>
      <li>Have job duties that can be effectively performed remotely</li>
      <li>Have a suitable home work environment</li>
      <li>Have reliable internet connectivity</li>
      <li>Have received approval from their supervisor and HR</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Remote Work Arrangements</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Type</label>
        <span>{{remote_work_type}}</span>
      </div>
      <div class="sl-info-item">
        <label>Remote Days</label>
        <span>{{remote_days}} per week</span>
      </div>
      <div class="sl-info-item">
        <label>Core Hours</label>
        <span>{{core_hours}}</span>
      </div>
      <div class="sl-info-item">
        <label>Effective Date</label>
        <span>{{effective_date}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>4. Employee Responsibilities</h2>
    <ul>
      <li>Maintain regular working hours and be available during core business hours</li>
      <li>Respond to communications promptly (within {{response_time}} during work hours)</li>
      <li>Attend all required meetings (virtual or in-person as needed)</li>
      <li>Maintain a professional and distraction-free work environment</li>
      <li>Keep work and personal activities separate during work hours</li>
      <li>Submit daily/weekly progress reports as required</li>
      <li>Report any technical issues immediately to IT support</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Equipment & Technology</h2>
    <ul>
      <li>Company will provide: {{equipment_provided}}</li>
      <li>Employee is responsible for maintaining a reliable internet connection (minimum {{min_internet_speed}} Mbps)</li>
      <li>All company equipment must be used in accordance with IT Acceptable Use Policy</li>
      <li>Equipment must be returned upon termination of remote work arrangement</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Data Security & Confidentiality</h2>
    <ul>
      <li>Use company VPN when accessing company systems</li>
      <li>Keep all work documents and data secure</li>
      <li>Do not allow unauthorized persons to access company equipment</li>
      <li>Use only authorized software and applications</li>
      <li>Ensure home Wi-Fi is password protected</li>
      <li>Lock your computer when not in use</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Communication</h2>
    <ul>
      <li>Use approved communication tools (email, Teams, Slack, etc.)</li>
      <li>Attend daily/weekly team check-ins as scheduled</li>
      <li>Keep calendar updated with availability</li>
      <li>Notify supervisor immediately of any issues affecting work</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Health & Safety</h2>
    <ul>
      <li>Maintain an ergonomic workstation to prevent injury</li>
      <li>Take regular breaks to prevent eye strain and fatigue</li>
      <li>Report any work-related injuries immediately</li>
      <li>Ensure home work area is safe and free from hazards</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Expenses</h2>
    <p>{{expense_policy}}</p>
  </div>

  <div class="sl-section">
    <h2>10. Termination of Remote Work</h2>
    <p>Remote work arrangements may be modified or terminated:</p>
    <ul>
      <li>By mutual agreement between employee and employer</li>
      <li>If business needs require on-site presence</li>
      <li>If employee fails to meet performance standards</li>
      <li>If employee violates this or any related policy</li>
    </ul>
    <p>{{company_name}} reserves the right to require return to office work with {{notice_period}} notice.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Agreement</h2>
    <p>I, <strong>{{employee_name}}</strong>, have read and agree to comply with this Remote Work Policy. I understand my responsibilities and the conditions under which remote work is permitted.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>{{position}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
    <div class="sl-signature-block">
      <h4>Supervisor Approval</h4>
      <p><strong>{{supervisor_name}}</strong></p>
      <p>Date: {{approval_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "remote_work_type", label: "Remote Work Type", type: "select", options: ["Fully Remote", "Hybrid", "Occasional"], default: "Hybrid" },
      { key: "remote_days", label: "Remote Days per Week", type: "select", options: ["1", "2", "3", "4", "5"], default: "2" },
      { key: "core_hours", label: "Core Hours", type: "text", default: "9:00 AM - 4:00 PM" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" },
      { key: "response_time", label: "Response Time", type: "select", options: ["30 minutes", "1 hour", "2 hours"], default: "1 hour" },
      { key: "equipment_provided", label: "Equipment Provided", type: "text", default: "Laptop, headset" },
      { key: "min_internet_speed", label: "Min Internet Speed (Mbps)", type: "select", options: ["5", "10", "20", "50"], default: "10" },
      { key: "expense_policy", label: "Expense Policy", type: "text", default: "Internet and utility costs are the employee's responsibility unless otherwise agreed." },
      { key: "notice_period", label: "Notice Period", type: "text", default: "2 weeks" },
      { key: "supervisor_name", label: "Supervisor Name", type: "text", default: "Line Manager" },
      { key: "approval_date", label: "Approval Date", type: "date", auto_fill: "today" }
    ]
  },

  probation_confirmation: {
    name: "Probation Confirmation Letter",
    content: `
<div class="sl-document">
  <div class="sl-watermark">CONFIRMED</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #059669 0%, #047857 100%);">✓</div>
    <h1>Confirmation of Employment</h1>
    <p class="sl-subtitle">{{company_name}} • Successful Completion of Probation</p>
    <p class="sl-ref-number">Ref: CONF-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <p>We are pleased to confirm that you have successfully completed your probationary period with {{company_name}}. This letter serves as official confirmation of your permanent employment status.</p>
  </div>

  <div class="sl-section">
    <h2>Employment Details</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #059669;">
      <h3 style="color: #059669;">🎉 Congratulations on Your Confirmation!</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Employee Name</label>
          <span>{{employee_name}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Employee Code</label>
          <span>{{employee_code}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Position</label>
          <span>{{position}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Department</label>
          <span>{{department}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Date of Joining</label>
          <span>{{hire_date}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Confirmation Date</label>
          <span>{{confirmation_date}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Probation Review Summary</h2>
    <p>During your probationary period, we have observed the following:</p>
    <ul>
      <li>Your performance has met the required standards</li>
      <li>You have demonstrated commitment to your role and responsibilities</li>
      <li>You have integrated well with the team and company culture</li>
      <li>{{additional_remarks}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Confirmation Benefits</h2>
    <p>As a confirmed employee, you are now entitled to:</p>
    <ul>
      <li><strong>Annual Leave:</strong> {{annual_leave_days}} working days per year (as per Employment Act 2023)</li>
      <li><strong>Sick Leave:</strong> 5 paid days per year with medical certificate</li>
      <li><strong>NASSIT Contributions:</strong> Employer contributes 10%, Employee contributes 5%</li>
      <li><strong>Notice Period:</strong> {{notice_period}} (as per Section 85, Employment Act 2023)</li>
      <li>{{additional_benefits}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Salary Confirmation</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Confirmed Salary</label>
        <span>SLE {{confirmed_salary}}</span>
      </div>
      <div class="sl-info-item">
        <label>Payment Frequency</label>
        <span>Monthly</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Terms of Employment</h2>
    <p>All other terms and conditions of your employment as outlined in your original employment contract remain in effect. This confirmation supersedes any probationary conditions previously applied.</p>
    <p>We value your contributions and look forward to your continued growth and success at {{company_name}}.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Acceptance</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge receipt of this confirmation letter and accept the terms of my permanent employment with {{company_name}}.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For the Company</h4>
      <p><strong>{{authorized_signatory}}</strong></p>
      <p>{{signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This confirmation letter forms part of your employment record.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "employee_code", label: "Employee Code", type: "text", auto_fill: "employee.employee_code" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "hire_date", label: "Date of Joining", type: "date", auto_fill: "employee.hire_date" },
      { key: "confirmation_date", label: "Confirmation Date", type: "date", auto_fill: "today" },
      { key: "additional_remarks", label: "Additional Remarks", type: "text", default: "Your attitude and work ethic have been commendable" },
      { key: "annual_leave_days", label: "Annual Leave Days", type: "select", options: ["21", "25", "30"], default: "21" },
      { key: "notice_period", label: "Notice Period", type: "select", options: ["1 month", "2 months", "3 months"], default: "1 month" },
      { key: "additional_benefits", label: "Additional Benefits", type: "text", default: "As per company policy" },
      { key: "confirmed_salary", label: "Confirmed Salary (SLE)", type: "number", auto_fill: "employee.base_salary" },
      { key: "authorized_signatory", label: "Authorized Signatory", type: "text", default: "HR Manager" },
      { key: "signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  },

  termination_letter: {
    name: "Termination Letter",
    content: `
<div class="sl-document">
  <div class="sl-watermark">CONFIDENTIAL</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">📋</div>
    <h1>Notice of Termination of Employment</h1>
    <p class="sl-subtitle">{{company_name}} • Official Notice</p>
    <p class="sl-ref-number">Ref: TERM-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Employee Name</label>
        <span>{{employee_name}}</span>
      </div>
      <div class="sl-info-item">
        <label>Employee Code</label>
        <span>{{employee_code}}</span>
      </div>
      <div class="sl-info-item">
        <label>Position</label>
        <span>{{position}}</span>
      </div>
      <div class="sl-info-item">
        <label>Department</label>
        <span>{{department}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <p>This letter serves as official notice of the termination of your employment with {{company_name}}. This decision has been made in accordance with the terms of your employment contract and the Employment Act 2023 of Sierra Leone.</p>
  </div>

  <div class="sl-section">
    <h2>Termination Details</h2>
    <div class="sl-highlight-box" style="background: #f1f5f9; border-color: #64748b;">
      <div class="sl-info-grid">
        <div class="sl-info-item">
          <label>Termination Type</label>
          <span>{{termination_type}}</span>
        </div>
        <div class="sl-info-item">
          <label>Notice Date</label>
          <span>{{notice_date}}</span>
        </div>
        <div class="sl-info-item">
          <label>Last Working Day</label>
          <span>{{last_working_day}}</span>
        </div>
        <div class="sl-info-item">
          <label>Notice Period</label>
          <span>{{notice_period}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Reason for Termination</h2>
    <p>{{termination_reason}}</p>
  </div>

  <div class="sl-section">
    <h2>Final Settlement</h2>
    <p>You will be entitled to the following in your final settlement:</p>
    <ul>
      <li><strong>Outstanding Salary:</strong> Calculated up to and including {{last_working_day}}</li>
      <li><strong>Accrued Annual Leave:</strong> Payment for any unused annual leave days</li>
      <li><strong>NASSIT:</strong> All contributions will be processed as per statutory requirements</li>
      <li>{{additional_entitlements}}</li>
    </ul>
    <p>Your final settlement will be processed within {{settlement_days}} working days of your last working day.</p>
  </div>

  <div class="sl-section">
    <h2>Company Property</h2>
    <p>Please ensure the return of all company property on or before your last working day, including:</p>
    <ul>
      <li>ID card and access cards</li>
      <li>Laptop, mobile phone, and other electronic equipment</li>
      <li>Keys to premises or vehicles</li>
      <li>Company documents, files, and records</li>
      <li>Any other company property in your possession</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Confidentiality</h2>
    <p>Please be reminded that your obligations regarding confidentiality and non-disclosure of company information continue beyond the termination of your employment, as per your signed Non-Disclosure Agreement and/or employment contract.</p>
  </div>

  <div class="sl-section">
    <h2>Exit Process</h2>
    <p>Please contact the HR department to schedule your exit interview and complete the clearance process. You will receive a service certificate upon completion of the exit formalities.</p>
  </div>

  <div class="sl-section">
    <h2>Rights Under Employment Act 2023</h2>
    <p>This termination is in accordance with the Employment Act 2023 of Sierra Leone. If you believe this termination is unfair, you have the right to:</p>
    <ul>
      <li>Request a written explanation of the reasons for termination</li>
      <li>File a complaint with the Labour Department</li>
      <li>Seek legal counsel for advice on your rights</li>
    </ul>
  </div>

  <div class="sl-section">
    <p>We thank you for your service to {{company_name}} and wish you success in your future endeavors.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>For {{company_name}}</h4>
      <p><strong>{{authorized_signatory}}</strong></p>
      <p>{{signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
  </div>

  <div class="sl-section" style="margin-top: 40px;">
    <h2>Acknowledgment of Receipt</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have received this Notice of Termination. I understand the terms outlined in this letter.</p>
    <p style="font-size: 12px; color: #666;"><em>Note: Signing this acknowledgment does not indicate acceptance of the termination decision, only receipt of this notice.</em></p>
    
    <div class="sl-info-grid" style="margin-top: 20px;">
      <div class="sl-info-item">
        <label>Signature</label>
        <span>_________________________</span>
      </div>
      <div class="sl-info-item">
        <label>Date</label>
        <span>_________________________</span>
      </div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This letter is confidential and should be treated as such.</p>
  </div>
</div>
    `,
    requires_signature: false,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "employee_code", label: "Employee Code", type: "text", auto_fill: "employee.employee_code" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "termination_type", label: "Termination Type", type: "select", options: ["Resignation (Voluntary)", "End of Contract", "Redundancy", "Termination (With Notice)", "Dismissal (Gross Misconduct)", "Retirement", "Mutual Agreement"], default: "Termination (With Notice)" },
      { key: "notice_date", label: "Notice Date", type: "date", auto_fill: "today" },
      { key: "last_working_day", label: "Last Working Day", type: "date" },
      { key: "notice_period", label: "Notice Period", type: "select", options: ["7 days", "1 month", "2 months", "3 months", "Immediate"], default: "1 month" },
      { key: "termination_reason", label: "Reason for Termination", type: "text", default: "As discussed in your meeting with HR and management." },
      { key: "additional_entitlements", label: "Additional Entitlements", type: "text", default: "Any other statutory entitlements as applicable" },
      { key: "settlement_days", label: "Settlement Days", type: "select", options: ["7", "14", "21", "30"], default: "14" },
      { key: "authorized_signatory", label: "Authorized Signatory", type: "text", default: "HR Manager" },
      { key: "signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  }
};

// CSS Styles for Sierra Leone themed documents
export const SL_DOCUMENT_STYLES = `
  .sl-document {
    font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 50px;
    background: white;
    color: #1a1a1a;
    line-height: 1.7;
    position: relative;
  }
  
  .sl-document::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
  }
  
  .sl-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 25px;
    border-bottom: 3px solid #0F1F3C;
    position: relative;
  }
  
  .sl-flag-bar {
    height: 10px;
    background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
    margin-bottom: 25px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .sl-company-logo {
    width: 80px;
    height: 80px;
    margin: 0 auto 15px;
    border-radius: 50%;
    background: linear-gradient(135deg, #1EB053 0%, #0072C6 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32px;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(30, 176, 83, 0.3);
  }
  
  .sl-header h1 {
    color: #0F1F3C;
    font-size: 26px;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 3px;
    font-weight: 700;
  }
  
  .sl-subtitle {
    color: #555;
    font-size: 14px;
    margin: 0;
    font-weight: 500;
  }
  
  .sl-ref-number {
    position: absolute;
    top: 0;
    right: 0;
    font-size: 11px;
    color: #888;
  }
  
  .sl-section {
    margin-bottom: 28px;
  }
  
  .sl-section h2 {
    color: #0F1F3C;
    font-size: 16px;
    font-weight: 600;
    border-left: 4px solid #1EB053;
    padding-left: 12px;
    margin-bottom: 15px;
    background: linear-gradient(to right, rgba(30, 176, 83, 0.08), transparent);
    padding-top: 8px;
    padding-bottom: 8px;
  }
  
  .sl-section p {
    margin-bottom: 12px;
    text-align: justify;
  }
  
  .sl-section li {
    margin-bottom: 8px;
  }
  
  .sl-section ul, .sl-section ol {
    padding-left: 25px;
    margin-top: 10px;
  }
  
  .sl-section ul li {
    position: relative;
    list-style: none;
    padding-left: 20px;
  }
  
  .sl-section ul li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #1EB053;
    font-weight: bold;
  }
  
  .sl-parties-box {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    margin: 20px 0;
  }
  
  .sl-party {
    padding: 15px;
    background: white;
    border-radius: 8px;
    border-left: 3px solid #1EB053;
  }
  
  .sl-party.employer {
    border-left-color: #0072C6;
  }
  
  .sl-party h3 {
    color: #0F1F3C;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 10px;
    font-weight: 600;
  }
  
  .sl-party p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  .sl-highlight-box {
    background: linear-gradient(135deg, #f0fdf4 0%, #ecfeff 100%);
    border: 1px solid #1EB053;
    border-radius: 10px;
    padding: 20px;
    margin: 20px 0;
  }
  
  .sl-highlight-box h3 {
    color: #1EB053;
    margin-bottom: 10px;
    font-size: 14px;
  }
  
  .sl-info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin: 15px 0;
  }
  
  .sl-info-item {
    padding: 12px;
    background: #f8fafc;
    border-radius: 8px;
    border-left: 3px solid #0072C6;
  }
  
  .sl-info-item label {
    display: block;
    font-size: 11px;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  
  .sl-info-item span {
    font-weight: 600;
    color: #0F1F3C;
  }
  
  .sl-acknowledgment {
    background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
    padding: 25px;
    border-radius: 10px;
    margin: 35px 0;
    border: 2px solid #f59e0b;
    position: relative;
  }
  
  .sl-acknowledgment::before {
    content: '⚠️';
    position: absolute;
    top: -12px;
    left: 20px;
    background: white;
    padding: 0 10px;
    font-size: 18px;
  }
  
  .sl-acknowledgment h2 {
    color: #b45309;
    margin-bottom: 15px;
    border: none;
    padding: 0;
    background: none;
  }
  
  .sl-signatures {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    margin-top: 50px;
    padding-top: 30px;
    border-top: 2px dashed #e2e8f0;
  }
  
  .sl-signature-block {
    text-align: center;
    padding: 20px;
    background: #fafafa;
    border-radius: 10px;
  }
  
  .sl-signature-block h4 {
    color: #64748b;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 15px;
  }
  
  .sl-signature-block p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  .sl-signature-line {
    margin-top: 40px;
    border-bottom: 2px solid #0F1F3C;
    padding-bottom: 5px;
    width: 80%;
    margin-left: auto;
    margin-right: auto;
  }
  
  .sl-digital-signature {
    margin-top: 20px;
    padding: 20px;
    background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%);
    border: 2px solid #1EB053;
    border-radius: 12px;
    text-align: center;
    font-family: 'Brush Script MT', 'Segoe Script', cursive;
    font-size: 28px;
    color: #0F1F3C;
    box-shadow: inset 0 2px 10px rgba(30, 176, 83, 0.1);
    position: relative;
  }
  
  .sl-digital-signature::after {
    content: '✓ Digitally Signed';
    position: absolute;
    bottom: -10px;
    right: 10px;
    font-size: 10px;
    font-family: 'Segoe UI', sans-serif;
    color: #1EB053;
    background: white;
    padding: 2px 8px;
    border-radius: 10px;
  }
  
  .sl-signature-date {
    font-weight: 700;
    color: #1EB053;
  }
  
  .sl-footer {
    margin-top: 50px;
    padding-top: 25px;
    text-align: center;
    color: #64748b;
    font-size: 11px;
    border-top: 1px solid #e2e8f0;
  }
  
  .sl-footer .sl-flag-bar {
    width: 150px;
    margin: 0 auto 15px;
    height: 6px;
  }
  
  .sl-footer-logo {
    font-size: 24px;
    margin-bottom: 10px;
  }
  
  .sl-footer p {
    margin: 5px 0;
  }
  
  .sl-legal-note {
    font-size: 10px;
    color: #94a3b8;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px dotted #e2e8f0;
  }
  
  .sl-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-45deg);
    font-size: 100px;
    color: rgba(30, 176, 83, 0.03);
    font-weight: bold;
    pointer-events: none;
    z-index: -1;
  }
  
  @media print {
    .sl-document {
      padding: 30px;
      box-shadow: none;
    }
    
    .sl-section {
      page-break-inside: avoid;
    }
    
    .sl-signatures {
      page-break-inside: avoid;
    }
    
    .sl-watermark {
      display: none;
    }
  }
  
  @media (max-width: 600px) {
    .sl-document {
      padding: 25px;
    }
    
    .sl-parties-box,
    .sl-signatures,
    .sl-info-grid {
      grid-template-columns: 1fr;
    }
    
    .sl-header h1 {
      font-size: 20px;
    }
  }
`;