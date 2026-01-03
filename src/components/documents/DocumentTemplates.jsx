// Sierra Leone HR Document Templates
// Based on Employment Act 2023 and local labor laws

export const DOCUMENT_TYPES = [
  "employment_contract",
  "nda",
  "code_of_conduct",
  "privacy_policy",
  "health_safety_policy",
  "anti_harassment_policy",
  "it_acceptable_use",
  "disciplinary_policy",
  "leave_policy",
  "remote_work_policy",
  "probation_confirmation",
  "promotion_letter",
  "termination_letter",
  "warning_letter",
  "salary_revision",
  "custom"
];

export const getDocumentTypeLabel = (type) => {
  return DOCUMENT_TYPE_INFO[type]?.label || type;
};

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
    <h2>Preamble</h2>
    <p>This Non-Disclosure Agreement ("Agreement") is entered into as of the Effective Date specified below by and between the parties identified herein. The purpose of this Agreement is to protect the confidential and proprietary information that may be disclosed during the course of the employment relationship.</p>
    <p>WHEREAS, the Company possesses certain confidential, proprietary, and trade secret information relating to its business operations, products, services, customers, strategies, and other matters; and</p>
    <p>WHEREAS, the Employee will have access to such Confidential Information in the course of performing their duties; and</p>
    <p>WHEREAS, the Company desires to protect its Confidential Information and the Employee agrees to maintain its confidentiality;</p>
    <p>NOW, THEREFORE, in consideration of the Employee's employment with the Company and the mutual covenants and agreements contained herein, the parties agree as follows:</p>
  </div>

  <div class="sl-section">
    <h2>Agreement Parties</h2>
    <div class="sl-parties-box">
      <div class="sl-party employer">
        <h3>🏢 Disclosing Party ("the Company")</h3>
        <p><strong>{{company_name}}</strong></p>
        <p>📍 {{company_address}}</p>
        <p>📋 Registration: {{company_registration}}</p>
      </div>
      <div class="sl-party">
        <h3>👤 Receiving Party ("the Employee")</h3>
        <p><strong>{{employee_name}}</strong></p>
        <p>📧 {{employee_email}}</p>
        <p>💼 Position: {{position}}</p>
      </div>
    </div>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Effective Date</label>
        <span>{{effective_date}}</span>
      </div>
      <div class="sl-info-item">
        <label>Post-Termination Duration</label>
        <span>{{duration_years}} years</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Article 1: Definition of Confidential Information</h2>
    <p><strong>1.1</strong> For purposes of this Agreement, "Confidential Information" means any and all non-public, proprietary, or trade secret information, in whatever form or medium, that is disclosed to, learned by, or otherwise becomes known to the Employee as a result of their employment with the Company, including but not limited to:</p>
    
    <p><strong>1.2 Business & Strategic Information:</strong></p>
    <ul>
      <li>Business plans, strategies, roadmaps, and future plans</li>
      <li>Mergers, acquisitions, partnerships, or restructuring plans</li>
      <li>Operational methods, processes, and procedures</li>
      <li>Organizational structure and internal communications</li>
      <li>Competitive analyses and market research</li>
    </ul>

    <p><strong>1.3 Financial Information:</strong></p>
    <ul>
      <li>Financial statements, projections, budgets, and forecasts</li>
      <li>Revenue, profit margins, cost structures, and pricing strategies</li>
      <li>Investment plans and capital allocation</li>
      <li>Banking relationships and credit arrangements</li>
      <li>Compensation structures and salary information</li>
    </ul>

    <p><strong>1.4 Customer & Commercial Information:</strong></p>
    <ul>
      <li>Customer lists, databases, and contact information</li>
      <li>Customer preferences, purchase history, and account details</li>
      <li>Supplier and vendor information, contracts, and terms</li>
      <li>Pricing, discounts, and commercial terms offered to customers</li>
      <li>Sales data, pipeline, and forecasts</li>
      <li>Proposals, quotations, and tender information</li>
    </ul>

    <p><strong>1.5 Technical & Intellectual Property:</strong></p>
    <ul>
      <li>Product designs, specifications, formulas, and recipes</li>
      <li>Manufacturing processes and techniques</li>
      <li>Software source code, algorithms, and technical documentation</li>
      <li>Research and development data and projects</li>
      <li>Patents, trademarks, and other intellectual property (whether registered or not)</li>
      <li>Trade secrets and know-how</li>
    </ul>

    <p><strong>1.6 Personnel Information:</strong></p>
    <ul>
      <li>Employee personal data and records</li>
      <li>Recruitment strategies and talent pipelines</li>
      <li>Performance evaluations and disciplinary records</li>
    </ul>

    <p><strong>1.7</strong> Confidential Information includes information received from third parties under obligations of confidentiality, and information that the Employee has reason to believe the Company would want to be treated as confidential.</p>
  </div>

  <div class="sl-section">
    <h2>Article 2: Employee Obligations</h2>
    <p>The Employee agrees and undertakes to:</p>
    
    <p><strong>2.1 Maintain Confidentiality:</strong></p>
    <ul>
      <li>Keep all Confidential Information strictly confidential and not disclose it to any person, organization, or entity, whether directly or indirectly</li>
      <li>Exercise the same degree of care to protect Confidential Information as a reasonable person would use to protect their own confidential information, but in no case less than reasonable care</li>
    </ul>

    <p><strong>2.2 Restrict Use:</strong></p>
    <ul>
      <li>Use Confidential Information solely and exclusively for the purpose of performing assigned job duties for the benefit of the Company</li>
      <li>Not use Confidential Information for personal gain, the benefit of any third party, or for any purpose other than the Company's legitimate business interests</li>
    </ul>

    <p><strong>2.3 Prevent Unauthorized Disclosure:</strong></p>
    <ul>
      <li>Take all reasonable precautions and measures to prevent unauthorized access to, disclosure of, or use of Confidential Information</li>
      <li>Not copy, reproduce, or duplicate Confidential Information except as necessary for job duties</li>
      <li>Store Confidential Information securely and in accordance with Company policies</li>
    </ul>

    <p><strong>2.4 Limit Access:</strong></p>
    <ul>
      <li>Not disclose Confidential Information to other employees except on a strict need-to-know basis for legitimate business purposes</li>
      <li>Not discuss Confidential Information in public places or where it may be overheard</li>
    </ul>

    <p><strong>2.5 Report Breaches:</strong></p>
    <ul>
      <li>Immediately notify management of any suspected or actual unauthorized disclosure, use, or access to Confidential Information</li>
      <li>Cooperate fully with any investigation into suspected breaches</li>
    </ul>

    <p><strong>2.6 Return Materials:</strong></p>
    <ul>
      <li>Upon termination of employment, request by the Company, or completion of the purpose for which information was disclosed, immediately return all Confidential Information in any form, including all copies, notes, summaries, and derivatives</li>
      <li>Permanently delete or destroy any Confidential Information stored on personal devices or in personal accounts</li>
      <li>Certify in writing, upon request, that all Confidential Information has been returned or destroyed</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Article 3: Exclusions from Confidential Information</h2>
    <p><strong>3.1</strong> The obligations of confidentiality under this Agreement shall not apply to information that:</p>
    <ul>
      <li><strong>(a)</strong> Is or becomes publicly available or enters the public domain through no breach of this Agreement by the Employee</li>
      <li><strong>(b)</strong> Was lawfully in the Employee's possession prior to disclosure by the Company, as evidenced by written records</li>
      <li><strong>(c)</strong> Is independently developed by the Employee without use of or reference to any Confidential Information</li>
      <li><strong>(d)</strong> Is lawfully received by the Employee from a third party who is not under an obligation of confidentiality to the Company</li>
      <li><strong>(e)</strong> Is required to be disclosed by applicable law, regulation, court order, or government authority, provided that the Employee gives prompt written notice to the Company (where legally permitted) and cooperates with the Company's efforts to obtain protective orders</li>
    </ul>
    <p><strong>3.2</strong> The burden of proving that any of the above exceptions applies rests with the Employee.</p>
  </div>

  <div class="sl-section">
    <h2>Article 4: Intellectual Property</h2>
    <p><strong>4.1</strong> The Employee acknowledges that all inventions, discoveries, improvements, ideas, designs, works of authorship, software, and other intellectual property (collectively "Work Product") created, conceived, or developed by the Employee, alone or jointly with others, during the course of employment and relating to the Company's business shall be the sole and exclusive property of the Company.</p>
    <p><strong>4.2</strong> The Employee hereby assigns to the Company all rights, title, and interest in and to any such Work Product and agrees to execute any documents necessary to perfect the Company's ownership.</p>
    <p><strong>4.3</strong> The Employee shall promptly disclose any Work Product to the Company and shall not seek to patent, register, or protect any such Work Product in their own name.</p>
  </div>

  <div class="sl-section">
    <h2>Article 5: Duration & Survival</h2>
    <div class="sl-highlight-box">
      <h3>⏱️ Agreement Duration</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item">
          <label>During Employment</label>
          <span>Obligations apply throughout employment</span>
        </div>
        <div class="sl-info-item">
          <label>After Termination</label>
          <span>{{duration_years}} years post-termination</span>
        </div>
      </div>
    </div>
    <p><strong>5.1</strong> This Agreement shall be effective from the Effective Date and shall continue in full force and effect during the Employee's employment with the Company.</p>
    <p><strong>5.2</strong> The obligations of confidentiality shall survive the termination of employment for any reason and shall remain binding for a period of <strong>{{duration_years}} years</strong> following the date of termination.</p>
    <p><strong>5.3</strong> Trade secrets shall remain protected for as long as they retain their status as trade secrets, regardless of the post-termination period specified above.</p>
    <p><strong>5.4</strong> Termination of this Agreement or the employment relationship shall not release the Employee from any obligations that accrued prior to termination.</p>
  </div>

  <div class="sl-section">
    <h2>Article 6: Non-Competition & Non-Solicitation</h2>
    <p><strong>6.1 Non-Competition (if applicable):</strong> During employment and for {{non_compete_period}} following termination, the Employee agrees not to engage in any business activity that directly competes with the Company within Sierra Leone, unless prior written consent is obtained.</p>
    <p><strong>6.2 Non-Solicitation of Customers:</strong> For {{non_solicit_period}} following termination, the Employee agrees not to solicit, divert, or attempt to divert any customers, clients, or business relationships of the Company with whom the Employee had material contact during employment.</p>
    <p><strong>6.3 Non-Solicitation of Employees:</strong> For {{non_solicit_period}} following termination, the Employee agrees not to recruit, solicit, or induce any employee or contractor of the Company to leave the Company's employment or engagement.</p>
    <p><strong>6.4</strong> These restrictions are considered reasonable and necessary to protect the Company's legitimate business interests. If any court finds these restrictions unenforceable, the court is requested to modify them to the minimum extent necessary to make them enforceable.</p>
  </div>

  <div class="sl-section">
    <h2>Article 7: Remedies for Breach</h2>
    <p><strong>7.1</strong> The Employee acknowledges and agrees that:</p>
    <ul>
      <li><strong>(a)</strong> The Confidential Information has significant commercial value and its unauthorized disclosure would cause irreparable harm to the Company</li>
      <li><strong>(b)</strong> Monetary damages alone would be insufficient to compensate for such harm</li>
      <li><strong>(c)</strong> The Company shall be entitled to seek immediate injunctive relief to prevent or stop any breach or threatened breach</li>
    </ul>
    <p><strong>7.2</strong> In the event of a breach, the Company shall be entitled to seek:</p>
    <ul>
      <li>Temporary, preliminary, and permanent injunctive relief</li>
      <li>Specific performance of the Employee's obligations</li>
      <li>Monetary damages, including consequential and indirect damages</li>
      <li>Disgorgement of any profits obtained through breach</li>
      <li>Recovery of legal costs, attorney fees, and expenses incurred in enforcement</li>
    </ul>
    <p><strong>7.3</strong> These remedies are cumulative and are in addition to any other remedies available at law or in equity.</p>
    <p><strong>7.4</strong> Breach of this Agreement may also result in disciplinary action, including termination of employment for cause.</p>
  </div>

  <div class="sl-section">
    <h2>Article 8: General Provisions</h2>
    <p><strong>8.1 Governing Law:</strong> This Agreement shall be governed by and construed in accordance with the laws of the Republic of Sierra Leone.</p>
    <p><strong>8.2 Jurisdiction:</strong> Any disputes arising from or relating to this Agreement shall be subject to the exclusive jurisdiction of the courts of Sierra Leone.</p>
    <p><strong>8.3 Severability:</strong> If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>
    <p><strong>8.4 Entire Agreement:</strong> This Agreement constitutes the entire agreement between the parties regarding confidentiality and supersedes any prior agreements or understandings, whether written or oral.</p>
    <p><strong>8.5 Amendment:</strong> This Agreement may only be amended by a written document signed by both parties.</p>
    <p><strong>8.6 Waiver:</strong> No waiver of any breach shall be deemed a waiver of any subsequent breach.</p>
    <p><strong>8.7 Assignment:</strong> The Company may assign this Agreement to any successor or affiliate. The Employee may not assign their obligations under this Agreement.</p>
    <p><strong>8.8 Notices:</strong> All notices under this Agreement shall be in writing and delivered to the addresses specified above.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Acknowledgment & Agreement</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge and agree that:</p>
    <ul>
      <li>I have read this Non-Disclosure Agreement carefully and understand all of its terms and conditions</li>
      <li>I have had the opportunity to seek independent legal advice before signing</li>
      <li>I voluntarily agree to be bound by all provisions of this Agreement</li>
      <li>I understand the serious consequences of any breach of this Agreement</li>
      <li>I have received adequate consideration for entering into this Agreement</li>
    </ul>
    <p>Both parties acknowledge that this Agreement has been executed voluntarily and with full understanding of its implications.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For the Company</h4>
      <p><strong>{{company_signatory}}</strong></p>
      <p>{{company_signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
      <p style="font-size: 10px; color: #888; margin-top: 5px;">Authorized Signature & Company Stamp</p>
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
    <p class="sl-legal-note">This Non-Disclosure Agreement is a legally binding contract under Sierra Leone law. Digital signatures are enforceable. This document should be retained by both parties.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "company_address", label: "Company Address", type: "text", auto_fill: "organisation.address", default: "Freetown, Sierra Leone" },
      { key: "company_registration", label: "Registration Number", type: "text", auto_fill: "organisation.business_registration_number", default: "N/A" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "employee_email", label: "Employee Email", type: "text", auto_fill: "employee.user_email" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" },
      { key: "duration_years", label: "Confidentiality Duration (years)", type: "select", options: ["1", "2", "3", "5", "7"], default: "2" },
      { key: "non_compete_period", label: "Non-Compete Period", type: "select", options: ["6 months", "12 months", "24 months", "Not applicable"], default: "12 months" },
      { key: "non_solicit_period", label: "Non-Solicitation Period", type: "select", options: ["6 months", "12 months", "24 months"], default: "12 months" },
      { key: "company_signatory", label: "Company Signatory", type: "text", default: "HR Manager" },
      { key: "company_signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  },

  anti_harassment_policy: {
    name: "Anti-Harassment Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">RESPECT</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);">🤝</div>
    <h1>Anti-Harassment & Workplace Dignity Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Creating a Respectful Workplace</p>
    <p class="sl-ref-number">Ref: AHP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Policy Statement & Commitment</h2>
    <p><strong>{{company_name}}</strong> is committed to maintaining a work environment that is free from all forms of harassment, discrimination, bullying, and victimization. Every employee has the right to be treated with dignity and respect, and to work in an environment that promotes equality, fairness, and professional conduct.</p>
    <p>This policy reflects our commitment to the principles enshrined in the Employment Act 2023 of Sierra Leone, which prohibits discrimination based on colour, disability, political opinion, national extraction, marriage, pregnancy and maternity, race, religion or belief, sexuality, sex, membership of a trade union, organisation or social origin (Section 33).</p>
    <p><strong>Zero Tolerance:</strong> {{company_name}} has a zero-tolerance policy towards harassment. All allegations will be taken seriously, investigated promptly, and appropriate action will be taken.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope & Application</h2>
    <p>This policy applies to:</p>
    <ul>
      <li><strong>All Employees:</strong> Permanent, temporary, casual, probationary, and contract staff at all levels</li>
      <li><strong>Third Parties:</strong> Contractors, consultants, agency workers, interns, and volunteers</li>
      <li><strong>All Situations:</strong> The workplace, work-related events, business trips, social functions, and any situation where employees interact in a work context</li>
      <li><strong>External Parties:</strong> Conduct between employees and customers, suppliers, or members of the public</li>
      <li><strong>Digital Communications:</strong> All forms of electronic communication including email, social media, instant messaging, and phone calls</li>
    </ul>
    <p>Harassment by or against any of the above is prohibited and will not be tolerated.</p>
  </div>

  <div class="sl-section">
    <h2>3. Protected Characteristics</h2>
    <p>In accordance with Sierra Leone law and international standards, harassment or discrimination based on the following characteristics is prohibited:</p>
    <div class="sl-info-grid">
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Race & Ethnicity</label>
        <span>Colour, national origin, ethnic background</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Gender & Sex</label>
        <span>Gender identity, sexual orientation</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Religion & Belief</label>
        <span>Religious beliefs, philosophical beliefs</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Disability</label>
        <span>Physical, mental, or sensory disabilities</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Age</label>
        <span>Young or older workers</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Family Status</label>
        <span>Pregnancy, maternity, paternity, marital status</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Political Opinion</label>
        <span>Political views or affiliations</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #7c3aed;">
        <label>Union Membership</label>
        <span>Trade union activities or membership</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>4. Types of Prohibited Conduct</h2>
    
    <div class="sl-highlight-box" style="background: #fef2f2; border-color: #dc2626;">
      <h3 style="color: #dc2626;">4.1 Sexual Harassment</h3>
      <p>Any unwelcome conduct of a sexual nature that makes someone feel intimidated, degraded, humiliated, or offended:</p>
      <ul>
        <li><strong>Physical:</strong> Unwanted touching, hugging, kissing, or physical contact; sexual assault</li>
        <li><strong>Verbal:</strong> Sexual comments, jokes, or innuendo; comments about appearance; requests for sexual favors; questions about sex life</li>
        <li><strong>Non-verbal:</strong> Staring, leering, suggestive gestures; displaying sexually explicit materials; sending sexual content</li>
        <li><strong>Quid Pro Quo:</strong> Conditioning employment benefits, promotions, or favorable treatment on sexual favors</li>
        <li><strong>Hostile Environment:</strong> Conduct that creates an intimidating, hostile, or offensive work environment</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="background: #fef3c7; border-color: #f59e0b; margin-top: 15px;">
      <h3 style="color: #d97706;">4.2 Bullying & Intimidation</h3>
      <p>Repeated unreasonable behavior directed toward an employee or group that creates a risk to health and safety:</p>
      <ul>
        <li>Verbal abuse, shouting, or aggressive behavior</li>
        <li>Persistent criticism, humiliation, or belittling in front of others</li>
        <li>Spreading malicious rumors or gossip</li>
        <li>Exclusion, isolation, or ignoring someone</li>
        <li>Setting impossible deadlines or unreasonable workloads</li>
        <li>Undermining someone's work or professional reputation</li>
        <li>Micromanagement designed to undermine confidence</li>
        <li>Physical intimidation, threats, or aggressive body language</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="background: #ede9fe; border-color: #7c3aed; margin-top: 15px;">
      <h3 style="color: #6d28d9;">4.3 Discrimination</h3>
      <p>Less favorable treatment based on protected characteristics:</p>
      <ul>
        <li><strong>Direct Discrimination:</strong> Treating someone less favorably because of a protected characteristic</li>
        <li><strong>Indirect Discrimination:</strong> Applying policies or practices that disadvantage people with certain characteristics</li>
        <li><strong>Harassment:</strong> Unwanted conduct related to a protected characteristic that violates dignity or creates a hostile environment</li>
        <li><strong>Victimization:</strong> Treating someone unfavorably because they made or supported a complaint</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="background: #ecfdf5; border-color: #10b981; margin-top: 15px;">
      <h3 style="color: #059669;">4.4 Cyberbullying & Digital Harassment</h3>
      <p>Harassment conducted through electronic means:</p>
      <ul>
        <li>Sending offensive, threatening, or abusive emails or messages</li>
        <li>Posting derogatory comments on social media</li>
        <li>Sharing embarrassing photos or videos without consent</li>
        <li>Creating fake profiles or impersonating others</li>
        <li>Excluding someone from online groups or communications</li>
        <li>Cyberstalking or persistent unwanted contact</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>5. What Is NOT Harassment</h2>
    <p>The following, when conducted appropriately and professionally, do not constitute harassment:</p>
    <ul>
      <li>Legitimate and reasonable management actions (performance management, disciplinary proceedings, work allocation)</li>
      <li>Constructive feedback on work performance delivered professionally</li>
      <li>Single isolated incidents that are minor (though patterns of such behavior may constitute harassment)</li>
      <li>Differences of opinion expressed respectfully</li>
      <li>Reasonable workplace banter that is welcomed by all parties</li>
    </ul>
    <p>However, if any behavior makes you uncomfortable, you are encouraged to speak up or report it.</p>
  </div>

  <div class="sl-section">
    <h2>6. Responsibilities</h2>
    <p><strong>All Employees are responsible for:</strong></p>
    <ul>
      <li>Treating all colleagues with dignity and respect</li>
      <li>Being aware of how their behavior may affect others</li>
      <li>Speaking up if they witness harassment or inappropriate behavior</li>
      <li>Cooperating with any investigation into allegations of harassment</li>
      <li>Maintaining confidentiality regarding complaints and investigations</li>
    </ul>

    <p><strong>Managers and Supervisors have additional responsibilities to:</strong></p>
    <ul>
      <li>Model respectful behavior and set a positive example</li>
      <li>Be vigilant for signs of harassment within their teams</li>
      <li>Take immediate action when they become aware of potential harassment</li>
      <li>Support employees who raise concerns</li>
      <li>Ensure their team understands this policy</li>
      <li>Not engage in or condone harassment</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Reporting Procedures</h2>
    <p>If you experience or witness harassment, you have several options:</p>
    
    <p><strong>Step 1: Informal Resolution (if appropriate)</strong></p>
    <ul>
      <li>If you feel comfortable, speak directly to the person and ask them to stop</li>
      <li>Sometimes people are unaware their behavior is unwelcome</li>
      <li>Keep a record of the conversation</li>
    </ul>

    <p><strong>Step 2: Seek Support</strong></p>
    <ul>
      <li>Speak confidentially with your supervisor (if not involved in the matter)</li>
      <li>Contact the HR department: {{hr_contact}}</li>
      <li>Speak with any member of management you trust</li>
      <li>Contact your trade union representative (if applicable)</li>
    </ul>

    <p><strong>Step 3: Formal Complaint</strong></p>
    <ul>
      <li>Submit a written complaint to HR or the designated complaints officer</li>
      <li>Include: dates, times, locations, description of incidents, names of witnesses</li>
      <li>Keep copies of any evidence (emails, messages, etc.)</li>
    </ul>

    <p><strong>Anonymous Reporting:</strong> You may report anonymously through {{anonymous_reporting_method}}. However, anonymous reports may be more difficult to investigate fully.</p>
  </div>

  <div class="sl-section">
    <h2>8. Investigation Process</h2>
    <p>All complaints will be handled according to the following process:</p>
    <ol>
      <li><strong>Receipt & Assessment (1-2 days):</strong> Acknowledgment of complaint; initial assessment of severity and urgency; determination of interim measures if needed</li>
      <li><strong>Investigation (typically {{investigation_timeline}}):</strong> Appointment of impartial investigator; interviews with complainant, alleged harasser, and witnesses; collection and review of evidence</li>
      <li><strong>Findings:</strong> Preparation of investigation report; determination of whether harassment occurred on the balance of probabilities</li>
      <li><strong>Outcome:</strong> Decision communicated to both parties; appropriate action taken based on findings</li>
      <li><strong>Appeal:</strong> Either party may appeal the decision within {{appeal_days}} working days</li>
    </ol>

    <p><strong>Investigation Principles:</strong></p>
    <ul>
      <li><strong>Confidentiality:</strong> Information shared only on a need-to-know basis</li>
      <li><strong>Fairness:</strong> Both parties given opportunity to present their case</li>
      <li><strong>Impartiality:</strong> Investigation conducted by someone without conflict of interest</li>
      <li><strong>Timeliness:</strong> Investigation completed as promptly as possible</li>
      <li><strong>Presumption of Innocence:</strong> Accused is presumed innocent until findings are determined</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Protection from Retaliation</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #10b981;">
      <h3 style="color: #059669;">🛡️ Non-Retaliation Guarantee</h3>
      <p><strong>{{company_name}}</strong> strictly prohibits any form of retaliation against anyone who:</p>
      <ul>
        <li>Makes a good-faith complaint of harassment</li>
        <li>Provides information or evidence in an investigation</li>
        <li>Supports a colleague who has made a complaint</li>
        <li>Refuses to participate in harassment</li>
      </ul>
      <p>Retaliation is itself a serious violation of this policy and will result in disciplinary action, up to and including termination.</p>
    </div>
    <p>Examples of retaliation include: demotion, unfavorable work assignments, exclusion, intimidation, threats, or any negative treatment as a result of making or supporting a complaint.</p>
  </div>

  <div class="sl-section">
    <h2>10. Consequences of Violations</h2>
    <p>Employees found to have engaged in harassment or discrimination will face disciplinary action proportionate to the severity of the conduct:</p>
    <ul>
      <li>Verbal or written warning</li>
      <li>Mandatory training or counseling</li>
      <li>Transfer or reassignment</li>
      <li>Demotion</li>
      <li>Suspension</li>
      <li>Termination of employment</li>
    </ul>
    <p>Serious cases of harassment, including sexual assault, may be reported to law enforcement authorities. The company will cooperate fully with any police investigation.</p>
    <p>False accusations made in bad faith will also be subject to disciplinary action.</p>
  </div>

  <div class="sl-section">
    <h2>11. Support Services</h2>
    <p>{{company_name}} recognizes that experiencing harassment can be distressing. The following support is available:</p>
    <ul>
      <li><strong>Employee Assistance:</strong> Confidential counseling and support services</li>
      <li><strong>HR Support:</strong> Guidance through the reporting and investigation process</li>
      <li><strong>Flexible Working:</strong> Temporary adjustments to work arrangements if needed</li>
      <li><strong>External Resources:</strong> Information about external support organizations</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Training & Prevention</h2>
    <p>To prevent harassment and promote a respectful workplace:</p>
    <ul>
      <li>All employees receive anti-harassment training during induction</li>
      <li>Refresher training provided {{training_frequency}}</li>
      <li>Managers receive additional training on handling complaints</li>
      <li>Regular communication reinforcing our commitment to a respectful workplace</li>
      <li>This policy is reviewed and updated {{policy_review_frequency}}</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understand this Anti-Harassment & Workplace Dignity Policy</li>
      <li>I understand what constitutes harassment, bullying, and discrimination</li>
      <li>I commit to treating all colleagues with dignity and respect</li>
      <li>I will not engage in any form of harassment or discrimination</li>
      <li>I will report any harassment I experience or witness</li>
      <li>I understand that violations of this policy may result in disciplinary action, up to and including termination</li>
      <li>I understand that I am protected from retaliation for reporting in good faith</li>
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
    <p class="sl-legal-note">This policy complies with the Employment Act 2023 of Sierra Leone. Everyone deserves to work with dignity and respect.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "hr_contact", label: "HR Contact", type: "text", default: "HR Department" },
      { key: "anonymous_reporting_method", label: "Anonymous Reporting Method", type: "text", default: "the confidential suggestion box or designated email" },
      { key: "investigation_timeline", label: "Investigation Timeline", type: "select", options: ["5-10 working days", "10-15 working days", "15-20 working days"], default: "10-15 working days" },
      { key: "appeal_days", label: "Appeal Period (Days)", type: "select", options: ["5", "7", "10"], default: "7" },
      { key: "training_frequency", label: "Training Frequency", type: "select", options: ["annually", "every 2 years"], default: "annually" },
      { key: "policy_review_frequency", label: "Policy Review Frequency", type: "select", options: ["annually", "every 2 years"], default: "annually" }
    ]
  },

  leave_policy: {
    name: "Leave Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">📅</div>
    <h1>Leave & Time-Off Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Comprehensive Leave Entitlements & Procedures</p>
    <p class="sl-ref-number">Ref: LP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Introduction & Purpose</h2>
    <p>This Leave Policy establishes the framework for managing all types of leave at <strong>{{company_name}}</strong>. It outlines the various leave entitlements available to employees, the procedures for requesting leave, and the responsibilities of both employees and managers in the leave management process.</p>
    <p>This policy is developed in full compliance with the Employment Act 2023 of Sierra Leone and reflects our commitment to supporting employees' work-life balance while maintaining operational effectiveness.</p>
    <p><strong>Scope:</strong> This policy applies to all permanent and fixed-term employees of {{company_name}}. Temporary and casual workers may have different entitlements as specified in their contracts.</p>
  </div>

  <div class="sl-section">
    <h2>2. Annual Leave (Vacation)</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%); border-color: #0284c7;">
      <h3 style="color: #0284c7;">🏖️ Annual Leave Entitlement</h3>
      <p>Per Section 44 of the Employment Act 2023, employees are entitled to:</p>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #0284c7;">
          <label>Annual Entitlement</label>
          <span>{{annual_leave_days}} working days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0284c7;">
          <label>Monthly Accrual</label>
          <span>1.75 days/month</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0284c7;">
          <label>Eligibility</label>
          <span>After 12 months service</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0284c7;">
          <label>Pro-rata in First Year</label>
          <span>Yes, for employees with 6+ months</span>
        </div>
      </div>
    </div>
    
    <p><strong>2.1 Accrual & Eligibility:</strong></p>
    <ul>
      <li>Full annual leave entitlement accrues after completing 12 months of continuous service</li>
      <li>Employees with 6-12 months of service may be eligible for pro-rated leave at management discretion</li>
      <li>Leave accrues monthly at a rate of approximately 1.75 days per month worked</li>
      <li>Probationary employees accrue leave but may only take it after confirmation</li>
    </ul>

    <p><strong>2.2 Taking Annual Leave:</strong></p>
    <ul>
      <li>Leave must be taken within 12 months of the anniversary date unless prior approval is obtained for carry-forward</li>
      <li>Submit leave requests at least {{annual_leave_notice}} in advance</li>
      <li>Approval is subject to business needs and operational requirements</li>
      <li>Managers should respond to leave requests within 5 working days</li>
      <li>During peak periods, leave may be restricted—these periods will be communicated in advance</li>
    </ul>

    <p><strong>2.3 Carry-Forward & Payment:</strong></p>
    <ul>
      <li>Maximum of {{carry_forward_days}} days may be carried forward to the next leave year with written management approval</li>
      <li>Carried-forward leave must be used within the first 6 months of the new leave year</li>
      <li>Unused leave cannot be exchanged for cash payment except upon termination of employment</li>
      <li>Upon termination, employees will be paid for accrued but unused annual leave</li>
    </ul>

    <p><strong>2.4 Leave During Notice Period:</strong></p>
    <ul>
      <li>Annual leave may be taken during the notice period only with prior management approval</li>
      <li>The company may require employees to use remaining leave during the notice period</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Sick Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #dc2626;">
      <h3 style="color: #dc2626;">🏥 Sick Leave Entitlement</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Paid Sick Days</label>
          <span>{{sick_leave_days}} days per year</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Medical Certificate Required</label>
          <span>After {{sick_cert_days}} consecutive days</span>
        </div>
      </div>
    </div>

    <p><strong>3.1 Notification Requirements:</strong></p>
    <ul>
      <li>Notify your supervisor as early as possible on the first day of illness, ideally before your normal start time</li>
      <li>Provide the expected duration of absence if known</li>
      <li>Keep your supervisor updated if the absence extends beyond initial expectations</li>
      <li>Provide contact details where you can be reached if needed</li>
    </ul>

    <p><strong>3.2 Documentation:</strong></p>
    <ul>
      <li>A medical certificate from a registered medical practitioner is required for absences of {{sick_cert_days}} or more consecutive working days</li>
      <li>The certificate must specify the nature of illness (unless confidential) and expected return date</li>
      <li>Self-certification is acceptable for shorter absences</li>
      <li>Certificates must be submitted within 48 hours of return to work</li>
    </ul>

    <p><strong>3.3 Extended Sick Leave:</strong></p>
    <ul>
      <li>If sick leave exceeds the annual entitlement, additional leave may be granted as unpaid leave</li>
      <li>Long-term illness exceeding {{long_term_sick_weeks}} weeks may trigger a review process</li>
      <li>The company may request an independent medical examination</li>
      <li>Return-to-work meetings will be conducted after extended absences</li>
    </ul>

    <p><strong>3.4 Sick Leave Abuse:</strong></p>
    <ul>
      <li>Patterns of absence (e.g., regular Monday/Friday absences) may be investigated</li>
      <li>Abuse of sick leave may result in disciplinary action</li>
      <li>Employees may be required to provide medical evidence for frequent short-term absences</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Maternity Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border-color: #a855f7;">
      <h3 style="color: #7c3aed;">👶 Maternity Leave (Section 47, Employment Act 2023)</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Total Entitlement</label>
          <span>14 weeks (98 days)</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Pre-Delivery Leave</label>
          <span>Up to 4 weeks before due date</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Post-Delivery Minimum</label>
          <span>6 weeks mandatory</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Pay Structure</label>
          <span>{{maternity_pay_structure}}</span>
        </div>
      </div>
    </div>

    <p><strong>4.1 Eligibility:</strong></p>
    <ul>
      <li>All female employees are entitled to maternity leave regardless of length of service</li>
      <li>Full pay entitlements may be subject to minimum service requirements as specified</li>
    </ul>

    <p><strong>4.2 Notification & Application:</strong></p>
    <ul>
      <li>Notify HR and your supervisor of pregnancy as soon as reasonably practicable</li>
      <li>Submit a medical certificate confirming pregnancy and expected due date</li>
      <li>Submit formal maternity leave application at least {{maternity_notice}} before intended start date</li>
      <li>Confirm intended return date in writing</li>
    </ul>

    <p><strong>4.3 Pay During Maternity Leave:</strong></p>
    <ul>
      <li>First 6 weeks: 100% of regular salary</li>
      <li>Remaining 8 weeks: {{maternity_remaining_pay}}% of regular salary</li>
      <li>NASSIT contributions continue during paid maternity leave</li>
    </ul>

    <p><strong>4.4 Job Protection:</strong></p>
    <ul>
      <li>Your position is protected during maternity leave as guaranteed by law</li>
      <li>You have the right to return to the same or equivalent position</li>
      <li>No employee may be dismissed or disadvantaged due to pregnancy or maternity leave</li>
    </ul>

    <p><strong>4.5 Nursing Breaks:</strong></p>
    <ul>
      <li>Upon return, nursing mothers are entitled to {{nursing_break_hours}} hour(s) per day for nursing during the first 12 months</li>
      <li>Nursing breaks may be taken as one break or split into shorter periods</li>
      <li>A private, hygienic space will be provided for nursing or expressing milk</li>
    </ul>

    <p><strong>4.6 Pregnancy-Related Illness:</strong></p>
    <ul>
      <li>If you are ill due to pregnancy before maternity leave begins, this may be treated as sick leave</li>
      <li>Pregnancy-related sick leave in the 4 weeks before due date may trigger automatic start of maternity leave</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Paternity Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-color: #3b82f6;">
      <h3 style="color: #2563eb;">👨‍👧 Paternity Leave</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Entitlement</label>
          <span>{{paternity_days}} working days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Pay</label>
          <span>Full pay</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Timeframe</label>
          <span>Within 2 weeks of birth</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Documentation</label>
          <span>Birth certificate required</span>
        </div>
      </div>
    </div>

    <p><strong>5.1 Eligibility & Application:</strong></p>
    <ul>
      <li>Available to male employees upon the birth of their child</li>
      <li>Notify HR and your supervisor of expected birth date in advance</li>
      <li>Submit formal application with birth certificate upon return</li>
      <li>Leave must be taken in one continuous period</li>
    </ul>

    <p><strong>5.2 Adoption:</strong></p>
    <ul>
      <li>Similar leave provisions apply for fathers in cases of legal adoption</li>
      <li>Documentation of adoption proceedings required</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Compassionate & Bereavement Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%); border-color: #78716c;">
      <h3 style="color: #57534e;">🕊️ Bereavement Leave</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #78716c;">
          <label>Immediate Family</label>
          <span>{{bereavement_immediate}} working days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #78716c;">
          <label>Extended Family</label>
          <span>{{bereavement_extended}} working days</span>
        </div>
      </div>
    </div>

    <p><strong>6.1 Immediate Family Bereavement:</strong></p>
    <ul>
      <li><strong>{{bereavement_immediate}} working days</strong> paid leave for death of: spouse/partner, child, parent, sibling</li>
      <li>Leave begins immediately upon notification</li>
      <li>Additional unpaid leave may be granted for travel or cultural obligations</li>
    </ul>

    <p><strong>6.2 Extended Family Bereavement:</strong></p>
    <ul>
      <li><strong>{{bereavement_extended}} working days</strong> paid leave for: grandparents, grandchildren, parents-in-law, aunts, uncles, nieces, nephews</li>
    </ul>

    <p><strong>6.3 Compassionate Leave (Non-Bereavement):</strong></p>
    <ul>
      <li>Up to 3 days paid leave may be granted for serious illness of immediate family members</li>
      <li>Emergency situations requiring employee's presence</li>
      <li>Approval at management discretion based on circumstances</li>
    </ul>

    <p><strong>6.4 Documentation:</strong></p>
    <ul>
      <li>Death certificate or equivalent documentation may be requested</li>
      <li>Relationship to deceased may need to be verified</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Public Holidays</h2>
    <p>All employees are entitled to paid leave on the following Sierra Leone public holidays:</p>
    <ul>
      <li>New Year's Day (January 1)</li>
      <li>Independence Day (April 27)</li>
      <li>Eid ul-Fitr (dates vary)</li>
      <li>Eid ul-Adha (dates vary)</li>
      <li>Christmas Day (December 25)</li>
      <li>Boxing Day (December 26)</li>
      <li>Other holidays as declared by the Government</li>
    </ul>
    <p><strong>Working on Public Holidays:</strong></p>
    <ul>
      <li>If you are required to work on a public holiday, compensation shall be at <strong>{{holiday_pay_rate}}x the regular rate</strong></li>
      <li>Alternatively, a day off in lieu may be granted with management approval</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Study & Examination Leave</h2>
    <ul>
      <li>Employees pursuing approved work-related qualifications may be granted study leave</li>
      <li>Up to {{study_leave_days}} days per year for examinations and preparation</li>
      <li>Prior approval required with course documentation</li>
      <li>Leave for examinations will be paid; additional study time may be unpaid</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Jury Duty & Court Attendance</h2>
    <ul>
      <li>Employees called for jury duty will receive full pay for the duration</li>
      <li>Proof of jury service must be provided</li>
      <li>Attendance as a witness (subpoenaed) is treated similarly</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Unpaid Leave</h2>
    <p>Unpaid leave may be granted at management discretion for:</p>
    <ul>
      <li>Personal matters not covered by other leave types</li>
      <li>Extended travel for personal reasons</li>
      <li>Career breaks (subject to separate agreement)</li>
    </ul>
    <p><strong>Requirements:</strong></p>
    <ul>
      <li>Submit written request at least {{unpaid_leave_notice}} in advance</li>
      <li>Maximum duration of {{unpaid_leave_max}} months in any 12-month period</li>
      <li>Approval subject to business needs</li>
      <li>NASSIT contributions will not be made during unpaid leave</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Leave Request Procedure</h2>
    <ol>
      <li><strong>Submit Request:</strong> Complete leave request form (paper or electronic) with dates and type of leave</li>
      <li><strong>Manager Review:</strong> Manager reviews request considering business needs and team coverage</li>
      <li><strong>Approval/Rejection:</strong> Manager approves or rejects with reason within 5 working days</li>
      <li><strong>Confirmation:</strong> Employee receives written confirmation of approved leave</li>
      <li><strong>Handover:</strong> Arrange proper handover of duties before leave commences</li>
      <li><strong>Emergency Contact:</strong> Provide contact details for emergencies</li>
    </ol>
  </div>

  <div class="sl-section">
    <h2>12. Manager Responsibilities</h2>
    <ul>
      <li>Process leave requests promptly and fairly</li>
      <li>Maintain adequate team coverage while allowing employees to take entitled leave</li>
      <li>Monitor leave patterns and address any concerns</li>
      <li>Ensure employees take their leave entitlements</li>
      <li>Maintain accurate leave records</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understood this Leave Policy</li>
      <li>I understand my leave entitlements and the procedures for requesting leave</li>
      <li>I agree to follow the proper procedures outlined in this policy</li>
      <li>I understand that abuse of leave provisions may result in disciplinary action</li>
      <li>I will provide timely notification and proper documentation as required</li>
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
    <p class="sl-legal-note">This policy complies with the Employment Act 2023 of Sierra Leone. Work-life balance is valued at {{company_name}}.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "annual_leave_days", label: "Annual Leave Days", type: "select", options: ["21", "25", "30"], default: "21" },
      { key: "annual_leave_notice", label: "Annual Leave Notice Period", type: "select", options: ["1 week", "2 weeks", "3 weeks"], default: "2 weeks" },
      { key: "carry_forward_days", label: "Max Carry-Forward Days", type: "select", options: ["5", "10", "15"], default: "10" },
      { key: "sick_leave_days", label: "Sick Leave Days Per Year", type: "select", options: ["5", "7", "10"], default: "5" },
      { key: "sick_cert_days", label: "Days Before Medical Certificate Required", type: "select", options: ["2", "3"], default: "2" },
      { key: "long_term_sick_weeks", label: "Long-Term Sick Review Threshold (Weeks)", type: "select", options: ["4", "6", "8"], default: "4" },
      { key: "maternity_pay_structure", label: "Maternity Pay Structure", type: "text", default: "6 weeks full pay + 8 weeks half pay" },
      { key: "maternity_notice", label: "Maternity Leave Notice Period", type: "select", options: ["4 weeks", "6 weeks", "8 weeks"], default: "6 weeks" },
      { key: "maternity_remaining_pay", label: "Remaining Maternity Pay %", type: "select", options: ["50", "75", "100"], default: "50" },
      { key: "nursing_break_hours", label: "Nursing Break Hours Per Day", type: "select", options: ["1", "1.5", "2"], default: "1" },
      { key: "paternity_days", label: "Paternity Leave Days", type: "select", options: ["3", "5", "7", "10"], default: "5" },
      { key: "bereavement_immediate", label: "Bereavement Leave - Immediate Family (Days)", type: "select", options: ["3", "5", "7"], default: "5" },
      { key: "bereavement_extended", label: "Bereavement Leave - Extended Family (Days)", type: "select", options: ["2", "3", "5"], default: "3" },
      { key: "holiday_pay_rate", label: "Holiday Pay Rate Multiplier", type: "select", options: ["1.5", "2", "2.5"], default: "2.5" },
      { key: "study_leave_days", label: "Study Leave Days Per Year", type: "select", options: ["3", "5", "7"], default: "5" },
      { key: "unpaid_leave_notice", label: "Unpaid Leave Notice Period", type: "select", options: ["1 week", "2 weeks", "4 weeks"], default: "2 weeks" },
      { key: "unpaid_leave_max", label: "Max Unpaid Leave (Months)", type: "select", options: ["1", "2", "3", "6"], default: "3" }
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
    <p class="sl-subtitle">{{company_name}} • Formal Disciplinary Notice</p>
    <p class="sl-ref-number">Ref: WL-{{document_ref}}</p>
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
      <div class="sl-info-item">
        <label>Warning Issued</label>
        <span>{{warning_date}}</span>
      </div>
      <div class="sl-info-item">
        <label>Incident Date</label>
        <span>{{incident_date}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <p>Following the disciplinary meeting held on {{meeting_date}} regarding {{violation_category}}, this letter serves as formal notification that you are receiving an <strong>official written warning</strong> in accordance with {{company_name}}'s Disciplinary Policy and the Employment Act 2023 of Sierra Leone.</p>
  </div>

  <div class="sl-section">
    <h2>Warning Classification</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #dc2626;">
      <h3 style="color: #dc2626;">⚠️ {{warning_level}} Warning</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Warning Type</label>
          <span>{{warning_type}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Severity Level</label>
          <span>{{warning_level}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Active Until</label>
          <span>{{warning_expiry_date}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #dc2626;">
          <label>Warning Validity Period</label>
          <span>{{warning_validity}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Details of Incident/Violation</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Date of Incident</label>
        <span>{{incident_date}}</span>
      </div>
      <div class="sl-info-item">
        <label>Time of Incident</label>
        <span>{{incident_time}}</span>
      </div>
      <div class="sl-info-item">
        <label>Location</label>
        <span>{{incident_location}}</span>
      </div>
      <div class="sl-info-item">
        <label>Witnesses Present</label>
        <span>{{witnesses}}</span>
      </div>
    </div>
    <p><strong>Description of Incident:</strong></p>
    <p>{{incident_description}}</p>
    <p>{{incident_details}}</p>
  </div>

  <div class="sl-section">
    <h2>Policy/Standard Violated</h2>
    <p>Your conduct/performance has been found to be in violation of:</p>
    <p><strong>{{policy_violated}}</strong></p>
    <p>{{policy_details}}</p>
    <p>This violation is considered a breach of the terms of your employment and the standards of conduct expected of all employees at {{company_name}}.</p>
  </div>

  <div class="sl-section">
    <h2>Previous Warnings & Disciplinary History</h2>
    <p>{{previous_warnings}}</p>
  </div>

  <div class="sl-section">
    <h2>Your Response During Meeting</h2>
    <p>During the disciplinary meeting on {{meeting_date}}, you provided the following explanation:</p>
    <p>{{employee_response}}</p>
    <p>After careful consideration of your explanation, the facts, and all available evidence, the decision has been made to issue this formal warning.</p>
  </div>

  <div class="sl-section">
    <h2>Required Corrective Action & Improvement Expectations</h2>
    <p>You are required to take the following immediate corrective actions:</p>
    <p>{{corrective_action}}</p>
    
    <p><strong>Performance Expectations Going Forward:</strong></p>
    <ul>
      <li>{{expectation_1}}</li>
      <li>{{expectation_2}}</li>
      <li>{{expectation_3}}</li>
    </ul>

    <p><strong>Review Period:</strong> Your conduct/performance will be monitored closely for the next {{review_period}}, during which time you must demonstrate sustained improvement.</p>
  </div>

  <div class="sl-section">
    <h2>Support Offered</h2>
    <p>To help you improve and succeed, the following support is being offered:</p>
    <ul>
      <li>Regular meetings with your supervisor to discuss progress ({{meeting_frequency}})</li>
      <li>Additional training or coaching as needed: {{training_offered}}</li>
      <li>Access to HR for guidance and support</li>
      <li>Clear performance targets and measurable goals</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Consequences of Further Violations</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%); border-color: #ef4444;">
      <h3 style="color: #dc2626;">⚠️ Important: Escalation Path</h3>
      <p>This is a <strong>{{warning_level}} Written Warning</strong>. Please be clearly advised that any further violations of company policies, rules, or standards of conduct, OR failure to demonstrate the required improvement, may result in escalated disciplinary action:</p>
      <ul>
        <li><strong>Further Written Warning:</strong> Escalation to next warning level if improvement not sustained</li>
        <li><strong>Final Written Warning:</strong> Last formal warning before potential dismissal</li>
        <li><strong>Suspension Without Pay:</strong> Temporary removal from duties as a disciplinary measure</li>
        <li><strong>Demotion:</strong> Reduction in position, responsibilities, or compensation</li>
        <li><strong>Termination of Employment:</strong> Dismissal from {{company_name}} with notice period</li>
      </ul>
    </div>
    <p><strong>Gross Misconduct:</strong> Any act of gross misconduct, as defined in Section 91 of the Employment Act 2023 and the company's Disciplinary Policy, may result in immediate summary dismissal without prior warning and without notice.</p>
  </div>

  <div class="sl-section">
    <h2>Warning Validity & Expiry</h2>
    <ul>
      <li>This {{warning_level}} Warning will remain active on your personnel record for <strong>{{warning_validity}}</strong></li>
      <li>The warning will expire on <strong>{{warning_expiry_date}}</strong> provided there are no further violations during this period</li>
      <li>After expiry, this warning will be considered "spent" for future disciplinary purposes</li>
      <li>However, patterns of similar behavior may still be considered even after warnings expire</li>
      <li>The record will be retained in your personnel file as per company policy and legal requirements</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Right of Appeal</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-color: #3b82f6;">
      <h3 style="color: #2563eb;">⚖️ You Have the Right to Appeal</h3>
      <p>If you disagree with this warning or believe the disciplinary process was unfair, you have the right to appeal this decision.</p>
      <ul>
        <li><strong>Appeal Deadline:</strong> Within <strong>{{appeal_days}} working days</strong> of receiving this letter</li>
        <li><strong>How to Appeal:</strong> Submit a written appeal to {{appeal_authority}} clearly stating your grounds for appeal</li>
        <li><strong>Grounds for Appeal:</strong> Procedural irregularities, new evidence, sanction is too harsh, mitigating circumstances not considered</li>
        <li><strong>Appeal Meeting:</strong> You will be invited to an appeal hearing where you may be accompanied by a colleague or union representative</li>
        <li><strong>Appeal Decision:</strong> The appeal decision will be communicated in writing and is final</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>Next Steps</h2>
    <p>Following this warning:</p>
    <ul>
      <li>Please sign this letter to acknowledge receipt and return it to HR within 3 working days</li>
      <li>Schedule a meeting with your supervisor to discuss improvement plan and expectations</li>
      <li>{{next_review_meeting}}</li>
      <li>Contact HR if you have questions or wish to appeal</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment of Receipt</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that:</p>
    <ul>
      <li>I have received this {{warning_level}} Warning Letter on {{warning_date}}</li>
      <li>I understand the nature of the violation and the policy/rule that was breached</li>
      <li>I understand the corrective actions required and the performance expectations</li>
      <li>I understand the consequences of further violations or failure to improve</li>
      <li>I understand my right to appeal this decision within {{appeal_days}} working days</li>
      <li>I had the opportunity to provide my explanation during the disciplinary hearing on {{meeting_date}}</li>
      <li>This warning will remain on my personnel file for {{warning_validity}}</li>
    </ul>
    <p style="font-size: 12px; color: #666; margin-top: 15px;"><em><strong>Important Note:</strong> Signing this letter acknowledges receipt and understanding of the warning. It does not necessarily indicate agreement with the findings or the decision. You retain the right to appeal if you believe the warning is unjustified or the process was unfair.</em></p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>Issued By</h4>
      <p><strong>{{issuing_manager}}</strong></p>
      <p>{{issuing_manager_title}}</p>
      <p>Date: {{warning_date}}</p>
      <div class="sl-signature-line"></div>
      <p style="font-size: 10px; color: #888; margin-top: 5px;">Authorized Signature</p>
    </div>
    <div class="sl-signature-block">
      <h4>Employee Acknowledgment</h4>
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
    <p class="sl-legal-note">This warning letter will be retained in the employee's personnel file as per company record-keeping policy and Employment Act 2023 requirements. Copies provided to: Employee, HR Department, Supervisor.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Reference Number", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "employee_code", label: "Employee Code", type: "text", auto_fill: "employee.employee_code" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "warning_date", label: "Warning Issued Date", type: "date", auto_fill: "today" },
      { key: "meeting_date", label: "Disciplinary Meeting Date", type: "date" },
      { key: "violation_category", label: "Violation Category", type: "select", options: ["attendance and punctuality issues", "performance concerns", "workplace conduct", "policy violations", "health and safety breaches"], default: "workplace conduct" },
      { key: "warning_type", label: "Warning Type/Category", type: "select", options: ["Attendance & Punctuality", "Performance Below Standard", "Conduct & Behavior", "Policy Violation", "Insubordination", "Health & Safety Violation", "Other"], default: "Conduct & Behavior" },
      { key: "warning_level", label: "Warning Level", type: "select", options: ["First Written", "Second Written", "Final Written"], default: "First Written" },
      { key: "incident_date", label: "Incident Date", type: "date" },
      { key: "incident_time", label: "Incident Time", type: "text", default: "During working hours" },
      { key: "incident_location", label: "Incident Location", type: "text", default: "Company premises" },
      { key: "witnesses", label: "Witnesses", type: "text", default: "As documented in investigation report" },
      { key: "incident_description", label: "Brief Description", type: "text", default: "The employee's conduct/performance was found to be in violation of company policy." },
      { key: "incident_details", label: "Detailed Description", type: "text", default: "As discussed during the disciplinary hearing, the investigation found that [provide specific details of the violation, including dates, times, and factual observations]." },
      { key: "policy_violated", label: "Policy/Rule Violated", type: "text", default: "Employee Code of Conduct - Section 2: Workplace Behavior" },
      { key: "policy_details", label: "Policy Details/Context", type: "text", default: "This section specifically prohibits [relevant prohibited behavior] and requires employees to [required standard]." },
      { key: "previous_warnings", label: "Previous Warnings/History", type: "text", default: "No previous warnings on file" },
      { key: "employee_response", label: "Employee's Explanation", type: "text", default: "You stated that [summarize employee's explanation provided during hearing]." },
      { key: "corrective_action", label: "Required Corrective Action", type: "text", default: "1. Immediately cease the behavior in question. 2. Attend a meeting with your supervisor to review expectations. 3. Demonstrate consistent compliance with company policies going forward." },
      { key: "expectation_1", label: "Expectation 1", type: "text", default: "Adhere strictly to all company policies and procedures" },
      { key: "expectation_2", label: "Expectation 2", type: "text", default: "Maintain professional conduct and behavior at all times" },
      { key: "expectation_3", label: "Expectation 3", type: "text", default: "Demonstrate sustained improvement over the review period" },
      { key: "review_period", label: "Review/Monitoring Period", type: "select", options: ["30 days", "60 days", "90 days", "6 months"], default: "90 days" },
      { key: "meeting_frequency", label: "Progress Meeting Frequency", type: "select", options: ["weekly", "bi-weekly", "monthly"], default: "bi-weekly" },
      { key: "training_offered", label: "Training/Support Offered", type: "text", default: "As assessed and agreed with supervisor" },
      { key: "warning_validity", label: "Warning Validity Period", type: "select", options: ["6 months", "12 months", "18 months", "24 months"], default: "12 months" },
      { key: "warning_expiry_date", label: "Warning Expiry Date", type: "date" },
      { key: "appeal_days", label: "Appeal Period (Working Days)", type: "select", options: ["5", "7", "10"], default: "5" },
      { key: "appeal_authority", label: "Appeal To", type: "text", default: "Human Resources Director or designated senior manager" },
      { key: "next_review_meeting", label: "Next Review Meeting", type: "text", default: "A progress review meeting will be scheduled in 30 days to assess improvement" },
      { key: "issuing_manager", label: "Issuing Manager Name", type: "text", default: "HR Manager" },
      { key: "issuing_manager_title", label: "Issuing Manager Title", type: "text", default: "Human Resources" }
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
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">💻</div>
    <h1>Information Technology Acceptable Use Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Technology Resources Guidelines & Security Requirements</p>
    <p class="sl-ref-number">Ref: IT-AUP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose & Objectives</h2>
    <p>This Information Technology Acceptable Use Policy ("IT Policy") establishes the rules and guidelines for the appropriate use of <strong>{{company_name}}</strong>'s information technology resources. The objectives of this policy are to:</p>
    <ul>
      <li>Protect company data, systems, and infrastructure from security threats</li>
      <li>Ensure efficient and productive use of IT resources</li>
      <li>Maintain compliance with applicable laws and regulations</li>
      <li>Preserve the integrity and availability of company information systems</li>
      <li>Protect the company's reputation and business interests</li>
      <li>Establish clear expectations for employee behavior when using IT resources</li>
    </ul>
    <p>All employees are responsible for using company IT resources in a professional, ethical, secure, and lawful manner. Violations of this policy may result in disciplinary action, including termination of employment.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope & Application</h2>
    <p>This policy applies to all {{company_name}} employees, contractors, temporary workers, consultants, and any other individuals granted access to company IT resources. It covers:</p>
    
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%); border-color: #6366f1;">
      <h3 style="color: #4f46e5;">🖥️ Covered IT Resources</h3>
      <ul>
        <li><strong>Hardware:</strong> Company-provided computers (desktops, laptops), tablets, smartphones, printers, scanners, servers, and networking equipment</li>
        <li><strong>Software:</strong> Operating systems, applications, databases, cloud services, and any licensed software</li>
        <li><strong>Communications:</strong> Email systems, instant messaging, video conferencing, VoIP, and collaboration platforms</li>
        <li><strong>Network:</strong> Company networks (wired and wireless), VPN connections, and internet access</li>
        <li><strong>Data:</strong> Company data in any form—electronic files, databases, documents, emails, and records</li>
        <li><strong>Personal Devices (BYOD):</strong> Personal devices used to access company systems, data, or networks</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>3. Ownership & Expectations</h2>
    <p><strong>3.1 Company Property:</strong></p>
    <ul>
      <li>All IT resources provided by {{company_name}} are company property</li>
      <li>All data created, stored, or transmitted using company resources is company property</li>
      <li>The company retains the right to access, inspect, and retrieve any information on company systems</li>
    </ul>

    <p><strong>3.2 No Expectation of Privacy:</strong></p>
    <ul>
      <li>Employees should have no expectation of privacy when using company IT resources</li>
      <li>All communications and activities may be monitored, logged, and reviewed</li>
      <li>Personal files or information stored on company systems are not private</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Acceptable Use</h2>
    <p>Company IT resources are provided primarily for business purposes. Acceptable use includes:</p>
    <ul>
      <li><strong>Business Activities:</strong> Performing assigned job duties, communicating with colleagues, clients, and stakeholders, accessing business information and applications</li>
      <li><strong>Professional Development:</strong> Training, research, and educational activities related to your role</li>
      <li><strong>Limited Personal Use:</strong> Reasonable personal use is permitted provided it:
        <ul>
          <li>Does not interfere with job responsibilities or productivity</li>
          <li>Does not violate any provision of this policy</li>
          <li>Does not consume excessive system resources or bandwidth</li>
          <li>Does not expose company systems to security risks</li>
          <li>Is kept to a minimum (e.g., during breaks)</li>
        </ul>
      </li>
    </ul>
    <p>Management reserves the right to restrict or revoke personal use privileges at any time.</p>
  </div>

  <div class="sl-section">
    <h2>5. Prohibited Activities</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #dc2626;">
      <h3 style="color: #dc2626;">⛔ Strictly Prohibited</h3>
      <p>The following activities are strictly prohibited and may result in immediate disciplinary action:</p>
    </div>

    <p><strong>5.1 Illegal Activities:</strong></p>
    <ul>
      <li>Any activity that violates Sierra Leone or international law</li>
      <li>Downloading, possessing, or distributing pirated software, music, movies, or other copyrighted materials</li>
      <li>Hacking, unauthorized access to systems, or attempting to circumvent security controls</li>
      <li>Engaging in fraud, identity theft, or financial crimes</li>
      <li>Distributing malware, viruses, or other malicious code</li>
    </ul>

    <p><strong>5.2 Inappropriate Content:</strong></p>
    <ul>
      <li>Accessing, downloading, storing, or distributing pornographic, sexually explicit, or obscene material</li>
      <li>Viewing, sending, or storing offensive, discriminatory, hateful, or harassing content</li>
      <li>Accessing gambling, illegal drug, or other inappropriate websites</li>
      <li>Using IT resources for purposes contrary to company values or professional standards</li>
    </ul>

    <p><strong>5.3 Security Violations:</strong></p>
    <ul>
      <li>Sharing passwords or login credentials with anyone (including IT staff)</li>
      <li>Using another person's account or allowing others to use your account</li>
      <li>Attempting to bypass, disable, or circumvent security controls or monitoring</li>
      <li>Installing unauthorized software, applications, browser extensions, or plugins</li>
      <li>Connecting unauthorized devices to company networks (including personal routers, hubs, or storage devices)</li>
      <li>Disabling or tampering with antivirus, firewall, or other security software</li>
      <li>Probing, scanning, or testing network or system security without authorization</li>
    </ul>

    <p><strong>5.4 Unauthorized Activities:</strong></p>
    <ul>
      <li>Using company IT resources for personal business, commercial ventures, or profit-making activities</li>
      <li>Operating a personal business using company email, website, or systems</li>
      <li>Cryptocurrency mining or other resource-intensive non-work activities</li>
      <li>Political campaigning or solicitation using company resources</li>
      <li>Mass distribution of emails (spam, chain letters, or unsolicited messages)</li>
    </ul>

    <p><strong>5.5 Data & Information:</strong></p>
    <ul>
      <li>Unauthorized access to or disclosure of confidential, proprietary, or sensitive information</li>
      <li>Transferring company data to personal accounts or unauthorized storage</li>
      <li>Sending sensitive information via unsecured channels (unencrypted email, public file sharing)</li>
      <li>Deleting, modifying, or destroying records in violation of retention policies</li>
    </ul>

    <p><strong>5.6 Misuse of Communications:</strong></p>
    <ul>
      <li>Sending harassing, threatening, abusive, or defamatory messages</li>
      <li>Impersonating another person or organization</li>
      <li>Creating false or misleading communications</li>
      <li>Forging email headers or other message identifiers</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Email & Electronic Communications</h2>
    <p><strong>6.1 Professional Standards:</strong></p>
    <ul>
      <li>Use professional, respectful language in all business communications</li>
      <li>Include appropriate signature blocks with contact information</li>
      <li>Use clear, descriptive subject lines</li>
      <li>Proofread messages before sending</li>
      <li>Reply to emails promptly within {{email_response_time}}</li>
    </ul>

    <p><strong>6.2 Email Security:</strong></p>
    <ul>
      <li>Do not open suspicious emails, attachments, or links from unknown senders</li>
      <li>Report suspected phishing attempts to IT immediately</li>
      <li>Verify unexpected requests for sensitive information or payments, even if they appear to come from executives</li>
      <li>Use encryption when sending sensitive or confidential information</li>
      <li>Do not auto-forward company emails to personal email accounts</li>
    </ul>

    <p><strong>6.3 Email Retention:</strong></p>
    <ul>
      <li>Important business emails should be retained according to company records retention policy</li>
      <li>Delete unnecessary emails to manage mailbox size</li>
      <li>Do not delete emails subject to legal holds or investigations</li>
    </ul>

    <p><strong>6.4 Instant Messaging & Collaboration Tools:</strong></p>
    <ul>
      <li>Use approved platforms only ({{approved_messaging_tools}})</li>
      <li>Apply the same professional standards as email</li>
      <li>Be mindful that messages may be logged and retained</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Password & Authentication Security</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #059669;">
      <h3 style="color: #059669;">🔐 Password Requirements</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Minimum Length</label>
          <span>{{min_password_length}} characters</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Complexity</label>
          <span>Upper, lower, number, symbol</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Change Frequency</label>
          <span>Every {{password_change_days}} days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Password History</label>
          <span>Cannot reuse last {{password_history}} passwords</span>
        </div>
      </div>
    </div>

    <p><strong>7.1 Password Best Practices:</strong></p>
    <ul>
      <li>Create strong, unique passwords for each system/account</li>
      <li>Never use easily guessable passwords (names, birthdates, dictionary words, "password123")</li>
      <li>Use a passphrase or password manager to generate and store complex passwords</li>
      <li>Never share your password with anyone—including IT staff, managers, or colleagues</li>
      <li>IT will never ask for your password; treat such requests as suspicious</li>
      <li>Change your password immediately if you suspect it has been compromised</li>
    </ul>

    <p><strong>7.2 Multi-Factor Authentication (MFA):</strong></p>
    <ul>
      <li>MFA is required for {{mfa_required_systems}}</li>
      <li>Keep your MFA device secure and report any loss immediately</li>
      <li>Never share MFA codes with anyone</li>
    </ul>

    <p><strong>7.3 Session Security:</strong></p>
    <ul>
      <li>Lock your computer (Windows: Win+L / Mac: Ctrl+Cmd+Q) whenever you leave your desk, even briefly</li>
      <li>Log out of systems when not in use, especially shared computers</li>
      <li>Do not leave logged-in sessions unattended</li>
      <li>Enable automatic screen lock (maximum {{screen_lock_mins}} minutes)</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Data Protection & Information Security</h2>
    <p><strong>8.1 Data Classification:</strong></p>
    <ul>
      <li><strong>Confidential:</strong> Highly sensitive data (financial records, personal data, trade secrets) — Strictest controls, encryption required, limited access</li>
      <li><strong>Internal:</strong> Business information not for public release — Access on need-to-know basis</li>
      <li><strong>Public:</strong> Information approved for external release</li>
    </ul>

    <p><strong>8.2 Data Handling Requirements:</strong></p>
    <ul>
      <li>Store company data only on approved systems (company servers, approved cloud services)</li>
      <li>Do not save company data on personal devices, USB drives, or personal cloud accounts without authorization</li>
      <li>Use encryption for sensitive data in transit and at rest</li>
      <li>Do not email or message highly confidential data; use secure file transfer methods</li>
      <li>Dispose of data securely according to retention policies</li>
    </ul>

    <p><strong>8.3 Backup & Recovery:</strong></p>
    <ul>
      <li>Save important work to network drives or approved cloud storage that are backed up</li>
      <li>Data stored only on local devices may not be backed up and could be lost</li>
      <li>Report any data loss or corruption to IT immediately</li>
    </ul>

    <p><strong>8.4 Clean Desk Policy:</strong></p>
    <ul>
      <li>Do not leave sensitive documents or information visible on screen when unattended</li>
      <li>Store physical documents containing sensitive information in locked cabinets</li>
      <li>Shred confidential documents before disposal</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Internet & Web Usage</h2>
    <p><strong>9.1 Acceptable Browsing:</strong></p>
    <ul>
      <li>Use internet access for work-related activities</li>
      <li>Limited personal browsing is permitted during breaks, provided it complies with this policy</li>
      <li>Do not stream non-work video or audio that consumes excessive bandwidth</li>
    </ul>

    <p><strong>9.2 Website Categories Blocked/Restricted:</strong></p>
    <ul>
      <li>Adult/pornographic content</li>
      <li>Gambling and betting sites</li>
      <li>Malware and phishing sites</li>
      <li>Hacking and proxy/anonymizer sites</li>
      <li>Illegal content and activities</li>
      <li>Certain social media during work hours (as configured)</li>
    </ul>

    <p><strong>9.3 Downloads:</strong></p>
    <ul>
      <li>Download software only from official, trusted sources</li>
      <li>Do not download unauthorized software, browser extensions, or plugins</li>
      <li>Report any accidental malware downloads to IT immediately</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Social Media & Public Communications</h2>
    <p><strong>10.1 Personal Social Media:</strong></p>
    <ul>
      <li>Never disclose confidential company information on social media</li>
      <li>Clearly distinguish personal opinions from company positions</li>
      <li>Do not use company logos, trademarks, or branding without authorization</li>
      <li>Be aware that your social media activity may reflect on the company</li>
      <li>Do not engage in discussions that could harm the company's reputation</li>
    </ul>

    <p><strong>10.2 Official Company Social Media:</strong></p>
    <ul>
      <li>Only authorized personnel may post on behalf of the company</li>
      <li>Follow brand guidelines and approval processes for official communications</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Mobile Devices & Remote Access</h2>
    <p><strong>11.1 Company Mobile Devices:</strong></p>
    <ul>
      <li>Keep devices physically secure at all times</li>
      <li>Enable screen lock with PIN, password, or biometric authentication</li>
      <li>Keep operating systems and apps updated</li>
      <li>Report lost or stolen devices immediately to IT</li>
      <li>Do not jailbreak, root, or modify device security</li>
    </ul>

    <p><strong>11.2 Bring Your Own Device (BYOD):</strong></p>
    <ul>
      <li>Personal devices must comply with company security requirements to access company resources</li>
      <li>The company may require installation of security software or MDM (Mobile Device Management)</li>
      <li>The company may remotely wipe company data from personal devices if lost, stolen, or upon termination</li>
      <li>Separate personal and work data where possible</li>
    </ul>

    <p><strong>11.3 Remote Access & VPN:</strong></p>
    <ul>
      <li>Use company VPN when accessing company resources from outside the office</li>
      <li>Do not use public Wi-Fi for sensitive work without VPN protection</li>
      <li>Ensure home networks are secured with strong passwords</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Software & Licensing</h2>
    <ul>
      <li>Only use properly licensed software provided or approved by IT</li>
      <li>Do not install personal software on company devices without authorization</li>
      <li>Do not make unauthorized copies of licensed software</li>
      <li>Report any software licensing concerns or compliance issues to IT</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>13. Incident Reporting</h2>
    <p>Report the following to IT immediately:</p>
    <ul>
      <li>Lost or stolen devices</li>
      <li>Suspected security breaches or unauthorized access</li>
      <li>Malware infections or suspicious system behavior</li>
      <li>Phishing emails or social engineering attempts</li>
      <li>Suspicious activities by others</li>
      <li>Accidental disclosure of confidential information</li>
    </ul>
    <p><strong>IT Security Contact:</strong> {{it_contact}}</p>
    <p>Prompt reporting enables faster response and minimizes damage. Employees will not be penalized for reporting incidents in good faith.</p>
  </div>

  <div class="sl-section">
    <h2>14. Monitoring & Auditing</h2>
    <p>{{company_name}} reserves the right to monitor all use of company IT resources to ensure compliance, maintain security, and protect business interests. Monitoring may include:</p>
    <ul>
      <li>Email content and metadata</li>
      <li>Internet browsing activity and history</li>
      <li>File access, transfers, and modifications</li>
      <li>Instant messaging and collaboration platform activity</li>
      <li>Application and system usage</li>
      <li>Login/logout times and access patterns</li>
      <li>Phone and call records on company devices</li>
    </ul>
    <p>By using company IT resources, you consent to such monitoring. Information obtained may be used for disciplinary or legal proceedings.</p>
  </div>

  <div class="sl-section">
    <h2>15. Consequences of Policy Violations</h2>
    <p>Violations of this IT Acceptable Use Policy are taken seriously and may result in:</p>
    <ul>
      <li><strong>Verbal or Written Warning:</strong> For minor, first-time violations</li>
      <li><strong>Restriction or Suspension of IT Access:</strong> Temporary or permanent limitation of privileges</li>
      <li><strong>Disciplinary Action:</strong> Up to and including termination of employment</li>
      <li><strong>Legal Action:</strong> For violations involving criminal activity, the company may involve law enforcement</li>
      <li><strong>Financial Liability:</strong> Employees may be held financially responsible for damages resulting from policy violations</li>
    </ul>
    <p>The severity of action will depend on the nature, frequency, and impact of the violation.</p>
  </div>

  <div class="sl-section">
    <h2>16. Policy Review & Updates</h2>
    <p>This policy is reviewed {{policy_review_frequency}} and updated as needed to address new technologies, threats, and business requirements. Employees will be notified of significant changes and may be required to re-acknowledge the updated policy.</p>
    <p><strong>Policy Version:</strong> {{policy_version}}<br/>
    <strong>Effective Date:</strong> {{effective_date}}</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment & Agreement</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge and agree that:</p>
    <ul>
      <li>I have received, read, and fully understood this IT Acceptable Use Policy</li>
      <li>I agree to comply with all provisions of this policy when using company IT resources</li>
      <li>I understand that company IT resources are provided for business purposes and that personal use is a privilege that may be revoked</li>
      <li>I understand that I have no expectation of privacy when using company IT resources</li>
      <li>I understand that my activities may be monitored, logged, and reviewed</li>
      <li>I will report any suspected security incidents or policy violations promptly</li>
      <li>I understand that violations of this policy may result in disciplinary action, including termination</li>
      <li>I understand that violations involving illegal activity may be reported to law enforcement</li>
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
    <p class="sl-legal-note">This policy protects both the company and employees. Use IT resources responsibly and securely.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "email_response_time", label: "Email Response Expectation", type: "select", options: ["4 hours", "8 hours", "24 hours", "48 hours"], default: "24 hours" },
      { key: "approved_messaging_tools", label: "Approved Messaging Tools", type: "text", default: "Microsoft Teams, Slack, Company Email" },
      { key: "min_password_length", label: "Minimum Password Length", type: "select", options: ["8", "10", "12", "14"], default: "10" },
      { key: "password_change_days", label: "Password Change Frequency (Days)", type: "select", options: ["30", "60", "90", "180"], default: "90" },
      { key: "password_history", label: "Password History Count", type: "select", options: ["5", "10", "12"], default: "10" },
      { key: "mfa_required_systems", label: "MFA Required Systems", type: "text", default: "email, VPN, cloud applications, and sensitive systems" },
      { key: "screen_lock_mins", label: "Auto Screen Lock (Minutes)", type: "select", options: ["5", "10", "15"], default: "10" },
      { key: "it_contact", label: "IT Security Contact", type: "text", default: "IT Department / it.support@company.com" },
      { key: "policy_review_frequency", label: "Policy Review Frequency", type: "select", options: ["annually", "every 2 years"], default: "annually" },
      { key: "policy_version", label: "Policy Version", type: "text", default: "1.0" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" }
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
    <p class="sl-subtitle">{{company_name}} • Fair & Consistent Standards in Accordance with Employment Act 2023</p>
    <p class="sl-ref-number">Ref: DP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose & Principles</h2>
    <p>This Disciplinary Policy establishes fair, transparent, and consistent procedures for addressing employee misconduct and performance issues at <strong>{{company_name}}</strong>. The policy serves to:</p>
    <ul>
      <li>Set clear standards of conduct and performance expected from all employees</li>
      <li>Provide a fair and systematic approach to dealing with alleged misconduct</li>
      <li>Help employees understand the consequences of misconduct and give them opportunities to improve</li>
      <li>Ensure compliance with the Employment Act 2023 of Sierra Leone and principles of natural justice</li>
      <li>Protect both the company's interests and employees' rights</li>
    </ul>

    <p><strong>Guiding Principles:</strong></p>
    <ul>
      <li><strong>Fairness:</strong> All employees will be treated fairly and consistently</li>
      <li><strong>Natural Justice:</strong> Right to be heard, right to know the case, right to respond, and right to appeal</li>
      <li><strong>Proportionality:</strong> Sanctions will be proportionate to the severity of the offense</li>
      <li><strong>Improvement Focus:</strong> The aim is correction and improvement, not punishment (except for gross misconduct)</li>
      <li><strong>Confidentiality:</strong> Disciplinary matters will be handled with appropriate discretion</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Scope & Application</h2>
    <p>This policy applies to all employees of {{company_name}}, including:</p>
    <ul>
      <li>Permanent employees (full-time and part-time)</li>
      <li>Fixed-term contract employees</li>
      <li>Probationary employees</li>
      <li>Temporary and casual workers</li>
    </ul>
    <p>Contractors and consultants are subject to their contractual terms, though similar principles may apply.</p>
  </div>

  <div class="sl-section">
    <h2>3. Categories of Misconduct</h2>
    
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #f59e0b;">
      <h3 style="color: #d97706;">3.1 Minor Misconduct</h3>
      <p>Less serious offenses that generally warrant progressive disciplinary steps:</p>
      <ul>
        <li><strong>Attendance Issues:</strong> Lateness, poor timekeeping, unauthorized absence for short periods</li>
        <li><strong>Performance Issues:</strong> Failure to meet performance standards, poor work quality (not due to incapacity)</li>
        <li><strong>Minor Policy Breaches:</strong> Failure to follow minor rules or procedures</li>
        <li><strong>Appearance:</strong> Inappropriate dress or personal appearance inconsistent with dress code</li>
        <li><strong>Minor Insubordination:</strong> Reluctance to follow reasonable instructions</li>
        <li><strong>Use of Resources:</strong> Minor misuse of company property or resources</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); border-color: #dc2626; margin-top: 15px;">
      <h3 style="color: #dc2626;">3.2 Serious Misconduct</h3>
      <p>More serious offenses that may warrant immediate written warnings or advanced disciplinary steps:</p>
      <ul>
        <li>Repeated minor misconduct after previous warnings</li>
        <li>Serious neglect of duties or performance failures</li>
        <li>Unauthorized disclosure of confidential information (not amounting to gross misconduct)</li>
        <li>Serious insubordination or refusal to carry out reasonable instructions</li>
        <li>Serious health and safety violations</li>
        <li>Inappropriate use of social media relating to the company</li>
        <li>Conduct bringing the company into disrepute</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #b91c1c; margin-top: 15px;">
      <h3 style="color: #991b1b;">3.3 Gross Misconduct (Per Section 91, Employment Act 2023)</h3>
      <p>Extremely serious offenses that may result in summary dismissal (immediate termination without notice):</p>
      <ul>
        <li><strong>Theft & Fraud:</strong> Theft of company or colleague property; fraud; falsification of documents, records, or expense claims</li>
        <li><strong>Violence & Threats:</strong> Physical violence or assault; threats of violence; fighting</li>
        <li><strong>Harassment:</strong> Sexual harassment; bullying; discrimination; serious verbal abuse</li>
        <li><strong>Dishonesty:</strong> Serious dishonesty; providing false information (e.g., fake qualifications, false sickness)</li>
        <li><strong>Property Damage:</strong> Deliberate or reckless damage to company property, equipment, or premises</li>
        <li><strong>Safety Violations:</strong> Serious breach of health and safety endangering self or others; ignoring safety warnings</li>
        <li><strong>Substance Abuse:</strong> Being under the influence of alcohol or illegal drugs at work; possession or distribution of illegal substances</li>
        <li><strong>Confidentiality Breach:</strong> Serious unauthorized disclosure of highly confidential information; selling company secrets</li>
        <li><strong>Insubordination:</strong> Gross insubordination or refusal to follow lawful instructions</li>
        <li><strong>Criminal Conduct:</strong> Conviction for a criminal offense affecting employment; conduct of a criminal nature at work</li>
        <li><strong>Computer Misuse:</strong> Hacking; installing malicious software; serious misuse of IT systems</li>
        <li><strong>Conflict of Interest:</strong> Serious conflict of interest; accepting bribes or kickbacks; corruption</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>4. Progressive Disciplinary Stages</h2>
    <p>For minor and serious misconduct, {{company_name}} follows a progressive discipline approach:</p>

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

    <p><strong>4.1 Verbal Warning (Informal):</strong></p>
    <ul>
      <li>Used for minor first-time offenses</li>
      <li>Discussion with supervisor about the issue and expected improvement</li>
      <li>Record of conversation noted but not placed on personnel file</li>
      <li>Remains active for {{verbal_warning_months}} months</li>
    </ul>

    <p><strong>4.2 First Written Warning:</strong></p>
    <ul>
      <li>For repeated minor misconduct or first instance of serious misconduct</li>
      <li>Formal written notification of the offense, required improvement, and consequences of failure</li>
      <li>Placed on personnel file</li>
      <li>Remains active for {{first_written_months}} months</li>
    </ul>

    <p><strong>4.3 Final Written Warning:</strong></p>
    <ul>
      <li>For repeated serious misconduct or very serious single incidents</li>
      <li>Last opportunity to improve before dismissal</li>
      <li>Clear statement of required improvement and timeframe</li>
      <li>Remains active for {{final_written_months}} months</li>
    </ul>

    <p><strong>4.4 Dismissal:</strong></p>
    <ul>
      <li>For continued failure to improve after final written warning</li>
      <li>For gross misconduct (summary dismissal without notice)</li>
      <li>Notice period as per employment contract and Employment Act 2023</li>
    </ul>

    <p><strong>Note:</strong> Depending on the severity of the offense, any stage may be bypassed. Serious misconduct may start at Stage 2 or 3. Gross misconduct may proceed directly to dismissal.</p>
  </div>

  <div class="sl-section">
    <h2>5. Detailed Disciplinary Procedure</h2>
    
    <p><strong>Step 1: Identification of Issue</strong></p>
    <ul>
      <li>Misconduct or performance issue is identified by supervisor, manager, HR, or reported by another employee</li>
      <li>Initial fact-gathering to determine if formal disciplinary process is warranted</li>
      <li>Consideration of informal resolution for very minor issues</li>
    </ul>

    <p><strong>Step 2: Investigation</strong></p>
    <ul>
      <li>Formal investigation launched for all matters proceeding to disciplinary action</li>
      <li>Investigator appointed (typically HR or manager not directly involved)</li>
      <li>Gathering of evidence: documents, CCTV, computer logs, witness statements</li>
      <li>Employee may be suspended on full pay if necessary during investigation</li>
      <li>Investigation aims to establish facts, not determine guilt</li>
      <li>Investigation report prepared summarizing findings</li>
      <li>Investigation completed within {{investigation_days}} working days where possible</li>
    </ul>

    <p><strong>Step 3: Disciplinary Hearing Notice</strong></p>
    <ul>
      <li>If investigation warrants disciplinary action, employee receives written notice at least {{hearing_notice_days}} hours (2 working days) before hearing</li>
      <li>Notice includes: allegations in detail, supporting evidence, date/time/location of hearing, right to representation</li>
      <li>Employee provided with investigation report and relevant documents in advance</li>
    </ul>

    <p><strong>Step 4: Disciplinary Hearing</strong></p>
    <ul>
      <li>Hearing chaired by manager with authority to impose sanctions</li>
      <li>HR representative present to ensure fair process</li>
      <li>Employee may be accompanied by colleague or trade union representative (not acting as legal representative)</li>
      <li>Allegations presented with evidence</li>
      <li>Employee given full opportunity to:
        <ul>
          <li>Respond to allegations and present their side</li>
          <li>Present evidence and call witnesses</li>
          <li>Ask questions and challenge evidence</li>
        </ul>
      </li>
      <li>Hearing may be adjourned for further investigation if needed</li>
      <li>Minutes taken as record of proceedings</li>
    </ul>

    <p><strong>Step 5: Decision</strong></p>
    <ul>
      <li>Decision-maker considers all evidence impartially</li>
      <li>Standard of proof: balance of probabilities (more likely than not)</li>
      <li>Decision communicated in writing within {{decision_days}} working days</li>
      <li>Written outcome includes: findings, sanction (if any), reasons, improvement expectations, review period, right to appeal</li>
    </ul>

    <p><strong>Step 6: Appeal (if applicable)</strong></p>
    <ul>
      <li>Employee may appeal within {{appeal_days}} working days by writing to {{appeal_authority}}</li>
      <li>Appeal grounds: procedural irregularities, new evidence, sanction too harsh</li>
      <li>Appeal heard by senior manager not previously involved</li>
      <li>Appeal decision is final</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Suspension</h2>
    <p><strong>6.1 Purpose of Suspension:</strong></p>
    <ul>
      <li>Suspension is a neutral act, not a punishment</li>
      <li>Used when employee's presence at work may:
        <ul>
          <li>Hinder the investigation</li>
          <li>Pose risk to people, property, or business</li>
          <li>Result in evidence tampering or witness intimidation</li>
        </ul>
      </li>
    </ul>

    <p><strong>6.2 Suspension Procedure:</strong></p>
    <ul>
      <li>Suspension normally with full pay unless contract permits unpaid suspension</li>
      <li>Written confirmation provided stating: reason, duration (typically pending investigation), terms</li>
      <li>Employee must remain available during normal working hours</li>
      <li>Employee must not contact colleagues, customers, or visit premises without authorization</li>
      <li>Employee must return company property as directed</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Warning Validity & Escalation</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Verbal Warning</label>
        <span>Active for {{verbal_warning_months}} months</span>
      </div>
      <div class="sl-info-item">
        <label>First Written Warning</label>
        <span>Active for {{first_written_months}} months</span>
      </div>
      <div class="sl-info-item">
        <label>Final Written Warning</label>
        <span>Active for {{final_written_months}} months</span>
      </div>
      <div class="sl-info-item">
        <label>After Expiry</label>
        <span>Warning becomes "spent"</span>
      </div>
    </div>
    <p>After the validity period, a warning is considered "spent" and will normally not be taken into account for future disciplinary matters. However:</p>
    <ul>
      <li>The record remains in the personnel file for reference</li>
      <li>Patterns of similar behavior may still be considered even after warnings expire</li>
      <li>Spent warnings may be referenced in cases of similar repeat offenses</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Right to Representation</h2>
    <p>At all formal stages of the disciplinary process, employees have the right to be accompanied by:</p>
    <ul>
      <li>A work colleague of their choice</li>
      <li>A trade union representative</li>
    </ul>
    <p>The representative may:</p>
    <ul>
      <li>Provide support and advice to the employee</li>
      <li>Ask questions and seek clarification</li>
      <li>Present the employee's case and summarize their position</li>
      <li>Confer with the employee during the hearing</li>
    </ul>
    <p>The representative may NOT answer questions on behalf of the employee or prevent management from explaining their case.</p>
    <p>Legal representatives are not permitted at internal disciplinary hearings.</p>
  </div>

  <div class="sl-section">
    <h2>9. Appeal Process</h2>
    <p><strong>9.1 Right to Appeal:</strong></p>
    <ul>
      <li>Employees have the right to appeal any disciplinary sanction</li>
      <li>Appeal must be submitted in writing within {{appeal_days}} working days of receiving the decision</li>
      <li>Appeal letter should clearly state the grounds for appeal</li>
    </ul>

    <p><strong>9.2 Grounds for Appeal:</strong></p>
    <ul>
      <li>Procedural irregularities that affected the outcome</li>
      <li>New evidence that was not available at the original hearing</li>
      <li>Sanction is too harsh or disproportionate</li>
      <li>Mitigation factors were not properly considered</li>
    </ul>

    <p><strong>9.3 Appeal Hearing:</strong></p>
    <ul>
      <li>Appeal heard by senior manager or director not previously involved</li>
      <li>Employee may be accompanied by colleague or union representative</li>
      <li>Appeal may: uphold original decision, reduce sanction, overturn decision</li>
      <li>Appeal decision is final and binding</li>
      <li>Decision communicated in writing within {{appeal_decision_days}} working days</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Special Considerations</h2>
    <p><strong>10.1 Criminal Charges or Convictions:</strong></p>
    <ul>
      <li>Criminal charges do not automatically result in dismissal</li>
      <li>Company will investigate impact on employment</li>
      <li>Suspension may be necessary pending outcome of criminal proceedings</li>
      <li>Conviction for relevant criminal offense may lead to dismissal</li>
    </ul>

    <p><strong>10.2 Capability vs. Conduct:</strong></p>
    <ul>
      <li>Poor performance due to lack of capability (skills, health) is handled differently from misconduct</li>
      <li>Capability issues addressed through performance management, training, or medical assessment</li>
    </ul>

    <p><strong>10.3 Mitigating Circumstances:</strong></p>
    <ul>
      <li>Length of service and previous record considered</li>
      <li>Personal circumstances and pressures</li>
      <li>Provocation or difficult situations</li>
      <li>Health or medical issues</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Records & Confidentiality</h2>
    <ul>
      <li>All disciplinary records maintained confidentially in personnel files</li>
      <li>Access restricted to authorized personnel only</li>
      <li>Records retained for {{disciplinary_record_years}} years after termination as required by law</li>
      <li>Disciplinary matters should not be discussed with unauthorized persons</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understand this Disciplinary Policy and Procedures</li>
      <li>I understand the standards of conduct expected of me</li>
      <li>I understand the categories of misconduct and their potential consequences</li>
      <li>I understand the disciplinary procedures that will be followed if issues arise</li>
      <li>I understand my rights during disciplinary proceedings, including the right to representation and appeal</li>
      <li>I commit to adhering to company policies, rules, and professional standards</li>
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
    <p class="sl-legal-note">This policy complies with Section 91 and other provisions of the Employment Act 2023 of Sierra Leone. Fair treatment and natural justice guide our disciplinary processes.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "investigation_days", label: "Investigation Target Days", type: "select", options: ["5", "7", "10", "14"], default: "10" },
      { key: "hearing_notice_days", label: "Hearing Notice (Hours)", type: "select", options: ["24", "48", "72"], default: "48" },
      { key: "decision_days", label: "Decision Communication (Days)", type: "select", options: ["3", "5", "7"], default: "5" },
      { key: "appeal_days", label: "Appeal Submission Period (Days)", type: "select", options: ["5", "7", "10"], default: "7" },
      { key: "appeal_decision_days", label: "Appeal Decision (Days)", type: "select", options: ["5", "7", "10"], default: "7" },
      { key: "appeal_authority", label: "Appeal Authority", type: "text", default: "Managing Director or designated senior manager" },
      { key: "verbal_warning_months", label: "Verbal Warning Validity (Months)", type: "select", options: ["3", "6"], default: "6" },
      { key: "first_written_months", label: "First Written Warning Validity (Months)", type: "select", options: ["6", "12", "18"], default: "12" },
      { key: "final_written_months", label: "Final Written Warning Validity (Months)", type: "select", options: ["12", "18", "24"], default: "24" },
      { key: "disciplinary_record_years", label: "Record Retention (Years)", type: "select", options: ["3", "5", "7"], default: "7" }
    ]
  },

  remote_work_policy: {
    name: "Remote Work Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">REMOTE</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);">🏠</div>
    <h1>Remote Work & Flexible Working Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Enabling Flexibility While Maintaining Excellence</p>
    <p class="sl-ref-number">Ref: RWP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose & Philosophy</h2>
    <p><strong>{{company_name}}</strong> recognizes that flexible working arrangements, including remote work, can enhance work-life balance, increase productivity, expand our talent pool, and reduce environmental impact. This policy establishes the framework for remote and hybrid work arrangements while ensuring we maintain our high standards of performance, collaboration, and service delivery.</p>
    <p>This policy aims to:</p>
    <ul>
      <li>Provide clear guidelines for remote work eligibility and expectations</li>
      <li>Balance employee flexibility with business operational needs</li>
      <li>Ensure remote workers remain engaged, productive, and connected to the team</li>
      <li>Maintain security, confidentiality, and compliance standards</li>
      <li>Support employee wellbeing and work-life integration</li>
    </ul>
    <p>Remote work is a privilege, not an entitlement, and is granted based on role suitability, business needs, and individual performance.</p>
  </div>

  <div class="sl-section">
    <h2>2. Types of Remote Work Arrangements</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Fully Remote</label>
        <span>Work from home 100% of the time</span>
      </div>
      <div class="sl-info-item">
        <label>Hybrid</label>
        <span>Split between office and remote</span>
      </div>
      <div class="sl-info-item">
        <label>Occasional Remote</label>
        <span>Ad-hoc remote days as needed</span>
      </div>
      <div class="sl-info-item">
        <label>Emergency Remote</label>
        <span>Temporary due to circumstances</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>3. Eligibility Criteria</h2>
    <p>Remote work may be approved for employees who meet the following criteria:</p>
    
    <p><strong>3.1 Employment Status:</strong></p>
    <ul>
      <li>Have successfully completed probationary period (minimum {{probation_completion}} months service)</li>
      <li>Hold a permanent or long-term fixed-term contract</li>
      <li>Have a satisfactory performance record</li>
    </ul>

    <p><strong>3.2 Role Suitability:</strong></p>
    <ul>
      <li>Job responsibilities can be performed effectively outside the office</li>
      <li>Role does not require constant physical presence (e.g., not warehouse staff, reception, some customer-facing roles)</li>
      <li>Tasks are measurable and can be monitored remotely</li>
      <li>Confidentiality and security requirements can be met from remote location</li>
    </ul>

    <p><strong>3.3 Performance & Behavior:</strong></p>
    <ul>
      <li>Demonstrated ability to work independently with minimal supervision</li>
      <li>Strong time management and organizational skills</li>
      <li>Proven track record of meeting deadlines and quality standards</li>
      <li>No recent disciplinary warnings</li>
      <li>Effective communication and responsiveness</li>
    </ul>

    <p><strong>3.4 Technical & Environmental Requirements:</strong></p>
    <ul>
      <li>Access to reliable, high-speed internet (minimum {{min_internet_speed}} Mbps)</li>
      <li>Quiet, dedicated workspace free from distractions</li>
      <li>Ability to participate in video calls without disruption</li>
      <li>Compliance with home insurance requirements (inform insurer of working from home)</li>
    </ul>

    <p><strong>3.5 Business Needs:</strong></p>
    <ul>
      <li>Team has adequate in-office coverage</li>
      <li>Customer service levels are not compromised</li>
      <li>Collaboration and team cohesion can be maintained</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Application & Approval Process</h2>
    <ol>
      <li><strong>Submit Request:</strong> Complete Remote Work Request Form with proposed schedule and justification</li>
      <li><strong>Manager Review:</strong> Direct supervisor assesses suitability and business impact</li>
      <li><strong>HR Approval:</strong> HR reviews compliance with policy and maintains records</li>
      <li><strong>Trial Period:</strong> Initial {{trial_period}} trial period to assess arrangement effectiveness</li>
      <li><strong>Ongoing Review:</strong> Regular reviews ({{review_frequency}}) to ensure arrangement remains suitable</li>
    </ol>
    <p>Approval is not guaranteed and is always subject to business requirements.</p>
  </div>

  <div class="sl-section">
    <h2>5. Your Remote Work Arrangement</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-color: #0ea5e9;">
      <h3 style="color: #0369a1;">📋 Approved Arrangement</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Work Type</label>
          <span>{{remote_work_type}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Remote Days per Week</label>
          <span>{{remote_days}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Office Days</label>
          <span>{{office_days}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Core Working Hours</label>
          <span>{{core_hours}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Effective From</label>
          <span>{{effective_date}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Trial Period</label>
          <span>{{trial_period}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>6. Working Hours & Availability</h2>
    <p><strong>6.1 Core Hours:</strong></p>
    <ul>
      <li>You must be available and responsive during core hours: <strong>{{core_hours}}</strong></li>
      <li>Flexibility allowed outside core hours in consultation with manager</li>
      <li>Total weekly hours remain as per employment contract (typically {{weekly_hours}} hours)</li>
    </ul>

    <p><strong>6.2 Availability & Communication:</strong></p>
    <ul>
      <li>Be online and responsive via email, phone, and messaging platforms</li>
      <li>Respond to messages within {{response_time}} during working hours</li>
      <li>Keep your calendar updated with availability, meetings, and time blocks</li>
      <li>Attend all required meetings (in-person or virtual) as scheduled</li>
      <li>Notify team if you need to step away during core hours</li>
    </ul>

    <p><strong>6.3 Attendance Tracking:</strong></p>
    <ul>
      <li>Log start and end times daily via {{attendance_system}}</li>
      <li>Record actual hours worked accurately</li>
      <li>Remote work days count as regular working days for attendance purposes</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Performance & Productivity Expectations</h2>
    <ul>
      <li>Performance standards remain the same whether working remotely or in office</li>
      <li>Deliverables, deadlines, and quality expectations are unchanged</li>
      <li>Submit {{reporting_frequency}} progress reports or updates as required</li>
      <li>Participate actively in team meetings and collaborative activities</li>
      <li>Maintain consistent output and responsiveness</li>
      <li>Performance will be measured by results, not hours online</li>
    </ul>
    <p>Poor performance or failure to meet expectations may result in modification or termination of remote work privileges.</p>
  </div>

  <div class="sl-section">
    <h2>8. Equipment, Technology & Technical Requirements</h2>
    <p><strong>8.1 Company-Provided Equipment:</strong></p>
    <ul>
      <li>The company will provide: {{equipment_provided}}</li>
      <li>Equipment remains company property and must be used for work purposes only</li>
      <li>Report any technical issues or equipment malfunction immediately to IT</li>
      <li>Equipment must be returned in good condition upon request or termination</li>
      <li>Loss, theft, or damage must be reported immediately</li>
    </ul>

    <p><strong>8.2 Internet & Connectivity:</strong></p>
    <ul>
      <li>Maintain reliable internet connection (minimum {{min_internet_speed}} Mbps download, {{min_upload_speed}} Mbps upload)</li>
      <li>Internet costs are {{internet_cost_responsibility}}</li>
      <li>Have a backup connectivity plan (e.g., mobile hotspot) for outages</li>
      <li>Test connectivity before each workday begins</li>
    </ul>

    <p><strong>8.3 Software & Applications:</strong></p>
    <ul>
      <li>Use only company-approved software and applications</li>
      <li>Keep all software updated to latest versions</li>
      <li>Do not install unauthorized software on company devices</li>
      <li>Access company systems via secure VPN connection</li>
    </ul>

    <p><strong>8.4 Technical Support:</strong></p>
    <ul>
      <li>IT support available during {{it_support_hours}}</li>
      <li>Contact IT via: {{it_contact}}</li>
      <li>Report major technical issues preventing work immediately</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Information Security & Data Protection</h2>
    <p><strong>9.1 Mandatory Security Practices:</strong></p>
    <ul>
      <li>Always connect via company VPN when accessing company systems, files, or email</li>
      <li>Use strong passwords and enable multi-factor authentication (MFA) on all accounts</li>
      <li>Lock your computer whenever stepping away (even at home)</li>
      <li>Ensure home Wi-Fi is secured with strong password encryption (WPA2 or better)</li>
      <li>Do not use public Wi-Fi networks for work without VPN</li>
      <li>Keep work devices physically secure—do not leave unattended in public</li>
    </ul>

    <p><strong>9.2 Confidential Information:</strong></p>
    <ul>
      <li>Do not discuss confidential work matters in public spaces or where others can overhear</li>
      <li>Position screens away from windows or areas visible to non-employees</li>
      <li>Do not allow family members or others to use company equipment or access company systems</li>
      <li>Shred confidential documents; do not dispose in household waste</li>
    </ul>

    <p><strong>9.3 Data Handling:</strong></p>
    <ul>
      <li>Store all work files on company servers or approved cloud storage, not local drives</li>
      <li>Do not email sensitive data to personal accounts</li>
      <li>Use encryption for sensitive file transfers</li>
      <li>Backup important work regularly</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Workspace & Health and Safety</h2>
    <p><strong>10.1 Home Workspace Requirements:</strong></p>
    <ul>
      <li>Dedicated workspace separate from living areas if possible</li>
      <li>Quiet environment free from significant distractions</li>
      <li>Adequate lighting to prevent eye strain</li>
      <li>Comfortable, ergonomic seating and desk setup</li>
      <li>Proper ventilation and temperature control</li>
      <li>Safe electrical installations—do not overload outlets</li>
    </ul>

    <p><strong>10.2 Ergonomics & Wellbeing:</strong></p>
    <ul>
      <li>Set up workstation to prevent musculoskeletal injuries (monitor at eye level, chair supports lower back)</li>
      <li>Take regular breaks (minimum {{break_frequency}} every 2 hours)</li>
      <li>Follow the 20-20-20 rule: every 20 mins, look at something 20 feet away for 20 seconds</li>
      <li>Maintain work-life boundaries—end work at designated time</li>
      <li>Take lunch breaks away from your desk</li>
    </ul>

    <p><strong>10.3 Workplace Inspection:</strong></p>
    <ul>
      <li>Company may request to inspect home workspace to ensure health and safety compliance</li>
      <li>Advance notice will be given, and employee consent obtained</li>
    </ul>

    <p><strong>10.4 Reporting Incidents:</strong></p>
    <ul>
      <li>Report any work-related injuries or illnesses immediately, even at home</li>
      <li>Complete accident report forms as you would for office incidents</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Communication & Collaboration</h2>
    <p><strong>11.1 Communication Tools:</strong></p>
    <ul>
      <li>Use approved platforms: {{approved_tools}}</li>
      <li>Keep status indicators accurate (available, away, in a meeting, etc.)</li>
      <li>Video cameras should be on for meetings unless technical issues arise</li>
      <li>Professional backgrounds for video calls</li>
    </ul>

    <p><strong>11.2 Meetings:</strong></p>
    <ul>
      <li>Attend all required team meetings, one-on-ones, and company-wide calls</li>
      <li>Be on time for virtual meetings—test technology beforehand</li>
      <li>Actively participate and engage; avoid multitasking during meetings</li>
      <li>In-person attendance may be required for certain meetings—advance notice will be given</li>
    </ul>

    <p><strong>11.3 Team Collaboration:</strong></p>
    <ul>
      <li>Proactively share updates and communicate progress</li>
      <li>Over-communicate rather than under-communicate when remote</li>
      <li>Be responsive to colleagues' questions and requests</li>
      <li>Contribute to team culture and maintain visibility</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Office Attendance Requirements</h2>
    <p>Even with remote work approval:</p>
    <ul>
      <li><strong>Hybrid Workers:</strong> Must attend office on designated days ({{office_days}})</li>
      <li><strong>Team Meetings:</strong> In-person attendance may be required for important team meetings, training, or events</li>
      <li><strong>Client Meetings:</strong> Attend in-person meetings with clients or stakeholders as needed</li>
      <li><strong>Core Hours:</strong> Be available during core hours regardless of location: {{core_hours}}</li>
      <li><strong>Flexibility:</strong> Schedule may be adjusted based on business needs with reasonable notice</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>13. Expenses & Allowances</h2>
    <p><strong>Company Provides:</strong></p>
    <ul>
      <li>{{equipment_provided}}</li>
      <li>{{company_covers}}</li>
    </ul>

    <p><strong>Employee Responsibility:</strong></p>
    <ul>
      <li>{{employee_pays}}</li>
    </ul>

    <p>{{expense_reimbursement}}</p>
  </div>

  <div class="sl-section">
    <h2>14. Conditions & Restrictions</h2>
    <ul>
      <li><strong>Location:</strong> Remote work must be from {{approved_location}}. Notify HR if changing primary work location</li>
      <li><strong>Childcare:</strong> Remote work is not a substitute for childcare. Adequate childcare arrangements must be in place</li>
      <li><strong>Other Employment:</strong> Remote work privileges do not permit secondary employment during work hours</li>
      <li><strong>Visitors:</strong> Minimize visitors during work hours to prevent distractions and protect confidentiality</li>
      <li><strong>Work Hours:</strong> Remote work does not mean 24/7 availability. Disconnect outside working hours</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>15. Manager Responsibilities</h2>
    <p>Managers of remote workers must:</p>
    <ul>
      <li>Set clear performance expectations and measurable objectives</li>
      <li>Maintain regular communication through one-on-ones and check-ins</li>
      <li>Provide feedback and support proactively</li>
      <li>Ensure remote workers are included in team activities and decisions</li>
      <li>Monitor performance based on results, not presence</li>
      <li>Address any performance or behavioral issues promptly</li>
      <li>Ensure equitable treatment of remote and office-based staff</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>16. Modification or Termination of Arrangement</h2>
    <p>Remote work arrangements may be modified or terminated:</p>
    <ul>
      <li><strong>By Mutual Agreement:</strong> At request of employee or management with discussion</li>
      <li><strong>Business Needs:</strong> Changing operational requirements may necessitate return to office ({{notice_period}} notice)</li>
      <li><strong>Performance Issues:</strong> If productivity, quality, or responsiveness declines</li>
      <li><strong>Policy Violations:</strong> Breach of this policy or related IT/security policies</li>
      <li><strong>Abuse of Privilege:</strong> Using remote work for unauthorized purposes</li>
      <li><strong>Role Change:</strong> New role may not be suitable for remote work</li>
    </ul>
    <p>{{company_name}} reserves the right to require return to full-time office work with reasonable notice.</p>
  </div>

  <div class="sl-section">
    <h2>17. Tax & Insurance Implications</h2>
    <ul>
      <li>Employees are responsible for any tax implications of working from home</li>
      <li>Inform your home/contents insurance provider that you are working from home</li>
      <li>Company insurance may not cover personal property used for work</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Agreement & Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge and agree that:</p>
    <ul>
      <li>I have read and fully understand this Remote Work & Flexible Working Policy</li>
      <li>I meet the eligibility criteria for remote work</li>
      <li>I agree to comply with all terms, conditions, and responsibilities outlined in this policy</li>
      <li>I will maintain professional standards, productivity, and quality when working remotely</li>
      <li>I understand that remote work is a privilege that may be modified or revoked</li>
      <li>I will ensure my home workspace meets health, safety, and security requirements</li>
      <li>I will maintain work-life boundaries and disconnect outside working hours</li>
      <li>I acknowledge that I remain bound by all company policies when working remotely</li>
      <li>I understand that violation of this policy may result in disciplinary action and/or termination of remote work arrangement</li>
    </ul>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>Employee</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>{{position}} • {{department}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
    <div class="sl-signature-block">
      <h4>Supervisor Approval</h4>
      <p><strong>{{supervisor_name}}</strong></p>
      <p>{{supervisor_title}}</p>
      <p>Date: {{approval_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">Remote work arrangements are subject to periodic review and may be adjusted based on business needs and performance.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "probation_completion", label: "Min Service for Remote (Months)", type: "select", options: ["3", "6", "12"], default: "6" },
      { key: "min_internet_speed", label: "Min Download Speed (Mbps)", type: "select", options: ["5", "10", "20", "50"], default: "10" },
      { key: "min_upload_speed", label: "Min Upload Speed (Mbps)", type: "select", options: ["2", "5", "10"], default: "5" },
      { key: "remote_work_type", label: "Remote Work Type", type: "select", options: ["Fully Remote", "Hybrid", "Occasional", "Emergency"], default: "Hybrid" },
      { key: "remote_days", label: "Remote Days per Week", type: "select", options: ["1", "2", "3", "4", "5"], default: "2" },
      { key: "office_days", label: "Office Days per Week", type: "text", default: "Tuesdays and Thursdays (or as agreed)" },
      { key: "core_hours", label: "Core Hours", type: "text", default: "9:00 AM - 4:00 PM" },
      { key: "weekly_hours", label: "Weekly Working Hours", type: "number", default: "40" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" },
      { key: "trial_period", label: "Trial Period", type: "select", options: ["1 month", "2 months", "3 months"], default: "3 months" },
      { key: "review_frequency", label: "Review Frequency", type: "select", options: ["monthly", "quarterly", "bi-annually"], default: "quarterly" },
      { key: "response_time", label: "Response Time Expectation", type: "select", options: ["30 minutes", "1 hour", "2 hours"], default: "1 hour" },
      { key: "reporting_frequency", label: "Progress Reporting", type: "select", options: ["daily", "weekly", "bi-weekly"], default: "weekly" },
      { key: "attendance_system", label: "Attendance System", type: "text", default: "company HRMS or timesheet system" },
      { key: "equipment_provided", label: "Equipment Provided by Company", type: "text", default: "Laptop, monitor, keyboard, mouse, headset" },
      { key: "internet_cost_responsibility", label: "Internet Cost Responsibility", type: "select", options: ["employee's responsibility", "company provides allowance", "company fully covers"], default: "employee's responsibility" },
      { key: "company_covers", label: "Company Covers", type: "text", default: "Equipment, software licenses, VPN access" },
      { key: "employee_pays", label: "Employee Pays", type: "text", default: "Internet, electricity, home workspace setup" },
      { key: "expense_reimbursement", label: "Expense Reimbursement", type: "text", default: "Reasonable business expenses incurred while working remotely will be reimbursed per company expense policy." },
      { key: "approved_location", label: "Approved Work Location", type: "text", default: "your registered home address within Sierra Leone" },
      { key: "it_support_hours", label: "IT Support Hours", type: "text", default: "Monday-Friday, 8:00 AM - 6:00 PM" },
      { key: "it_contact", label: "IT Contact", type: "text", default: "it.support@company.com or internal ext. 101" },
      { key: "break_frequency", label: "Break Frequency", type: "text", default: "5-10 minute breaks" },
      { key: "approved_tools", label: "Approved Communication Tools", type: "text", default: "Email, Microsoft Teams, Zoom, company phone system" },
      { key: "notice_period", label: "Notice Period for Return to Office", type: "select", options: ["1 week", "2 weeks", "4 weeks"], default: "2 weeks" },
      { key: "supervisor_name", label: "Supervisor Name", type: "text", default: "Line Manager" },
      { key: "supervisor_title", label: "Supervisor Title", type: "text", default: "Department Manager" },
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
    <p class="sl-subtitle">{{company_name}} • Successful Completion of Probationary Period</p>
    <p class="sl-ref-number">Ref: CONF-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #059669;">
      <h3 style="color: #047857; text-align: center; font-size: 18px;">🎉 Congratulations!</h3>
      <p style="text-align: center; font-size: 15px; margin-bottom: 0;">We are delighted to confirm that you have successfully completed your probationary period with <strong>{{company_name}}</strong> and are now a permanent member of our team.</p>
    </div>
    <p>This letter serves as official confirmation of your permanent employment status with {{company_name}}, effective from <strong>{{confirmation_date}}</strong>.</p>
  </div>

  <div class="sl-section">
    <h2>Employment Details</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Full Name</label>
        <span>{{employee_name}}</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Employee Code</label>
        <span>{{employee_code}}</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Job Title</label>
        <span>{{position}}</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Department</label>
        <span>{{department}}</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Start Date</label>
        <span>{{hire_date}}</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Probation Completion</label>
        <span>{{probation_end_date}}</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Confirmation Date</label>
        <span>{{confirmation_date}}</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #059669;">
        <label>Reports To</label>
        <span>{{reports_to}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Probationary Period Review Summary</h2>
    <p>During your {{probation_duration}} probationary period, your performance has been assessed across several key areas. We are pleased to report:</p>
    
    <p><strong>Performance Highlights:</strong></p>
    <ul>
      <li><strong>Job Performance:</strong> You have consistently met or exceeded the performance standards required for your role</li>
      <li><strong>Quality of Work:</strong> Your work quality demonstrates attention to detail and adherence to company standards</li>
      <li><strong>Reliability:</strong> You have shown excellent attendance and punctuality</li>
      <li><strong>Teamwork & Collaboration:</strong> You have integrated well with your team and demonstrated strong collaborative skills</li>
      <li><strong>Communication:</strong> You communicate effectively with colleagues and management</li>
      <li><strong>Company Values:</strong> You embody {{company_name}}'s values and contribute positively to our culture</li>
      <li><strong>Initiative & Learning:</strong> You have shown willingness to learn, take initiative, and contribute ideas</li>
    </ul>

    <p><strong>Supervisor's Comments:</strong></p>
    <p>{{supervisor_comments}}</p>

    <p><strong>Additional Remarks:</strong></p>
    <p>{{additional_remarks}}</p>
  </div>

  <div class="sl-section">
    <h2>Confirmed Compensation & Benefits</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #f59e0b;">
      <h3 style="color: #d97706;">💰 Remuneration Package</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #f59e0b;">
          <label>Monthly Gross Salary</label>
          <span>SLE {{confirmed_salary}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #f59e0b;">
          <label>Payment Date</label>
          <span>{{payment_date}} of each month</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #f59e0b;">
          <label>Payment Method</label>
          <span>{{payment_method}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #f59e0b;">
          <label>Salary Increase (if applicable)</label>
          <span>{{salary_increase}}</span>
        </div>
      </div>
    </div>

    <p><strong>Statutory Deductions:</strong></p>
    <ul>
      <li><strong>NASSIT:</strong> Employee contribution 5%, Employer contribution 10%</li>
      <li><strong>PAYE:</strong> Calculated per National Revenue Authority (NRA) tax brackets</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Benefits & Entitlements</h2>
    <p>As a confirmed permanent employee, you are now entitled to the following benefits:</p>

    <p><strong>Leave Entitlements (per Employment Act 2023):</strong></p>
    <ul>
      <li><strong>Annual Leave:</strong> {{annual_leave_days}} working days per year</li>
      <li><strong>Sick Leave:</strong> Up to 5 days paid sick leave per year (medical certificate required for 2+ consecutive days)</li>
      <li><strong>Maternity Leave:</strong> 14 weeks (if applicable) as per Section 47 of Employment Act 2023</li>
      <li><strong>Paternity Leave:</strong> 5 working days (if applicable)</li>
      <li><strong>Compassionate Leave:</strong> 5 days for immediate family bereavement</li>
      <li><strong>Public Holidays:</strong> All Sierra Leone public holidays as declared</li>
    </ul>

    <p><strong>Additional Benefits:</strong></p>
    <p>{{additional_benefits}}</p>

    <p><strong>Professional Development:</strong></p>
    <ul>
      <li>Eligibility for training and development programs</li>
      <li>Performance reviews conducted {{performance_review_frequency}}</li>
      <li>Career progression opportunities based on merit</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Notice Period & Termination</h2>
    <p>As a confirmed employee:</p>
    <ul>
      <li><strong>Notice Period:</strong> {{notice_period}} notice required from either party for termination (as per Section 85, Employment Act 2023)</li>
      <li>During probation, notice period was 7 days; this now increases to the confirmed notice period</li>
      <li>Summary dismissal without notice may occur only in cases of gross misconduct as defined in Section 91 of Employment Act 2023</li>
      <li>All statutory entitlements (leave pay, final salary) will be settled upon termination</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Continued Expectations</h2>
    <p>While we celebrate this milestone, we also remind you of our continued expectations:</p>
    <ul>
      <li>Maintain the high performance standards you demonstrated during probation</li>
      <li>Continue to uphold company policies, values, and code of conduct</li>
      <li>Seek opportunities for growth and skill development</li>
      <li>Collaborate effectively with colleagues and contribute to team success</li>
      <li>Communicate proactively with your supervisor about workload, challenges, or support needs</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Ongoing Terms of Employment</h2>
    <ul>
      <li>All other terms and conditions of your employment as outlined in your original employment contract dated {{contract_date}} remain in full force and effect</li>
      <li>This confirmation letter does not create a new contract but confirms the transition from probationary to permanent status</li>
      <li>You remain bound by confidentiality, non-disclosure, and other agreements signed at commencement</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Next Steps</h2>
    <ul>
      <li>Please sign and return this letter within 7 days as acknowledgment and acceptance</li>
      <li>Your personnel file will be updated to reflect your permanent status</li>
      <li>{{next_steps}}</li>
    </ul>
  </div>

  <div class="sl-section" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding: 20px; border-radius: 10px; border-left: 4px solid #0ea5e9;">
    <h2 style="color: #0369a1; border: none; padding: 0; background: none;">Welcome to the Team!</h2>
    <p>On behalf of everyone at <strong>{{company_name}}</strong>, we want to express our appreciation for your hard work and dedication during the probationary period. Your contributions have already made a positive impact, and we are excited to have you as a permanent member of our team.</p>
    <p>We look forward to your continued success, professional growth, and valuable contributions to {{company_name}}. Welcome aboard permanently!</p>
    <p style="margin-bottom: 0;"><em>— {{signatory_name}}, {{signatory_title}}</em></p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acceptance</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge and accept that:</p>
    <ul>
      <li>I have received and read this Confirmation of Employment letter</li>
      <li>I understand and accept the terms of my permanent employment</li>
      <li>I accept the confirmed salary and benefits as outlined</li>
      <li>I understand the notice period requirements</li>
      <li>I commit to upholding the standards and expectations of {{company_name}}</li>
      <li>All terms of my original employment contract remain in effect</li>
    </ul>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For {{company_name}}</h4>
      <p><strong>{{authorized_signatory}}</strong></p>
      <p>{{signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
      <p style="font-size: 10px; color: #888; margin-top: 5px;">Authorized Signature & Company Stamp</p>
    </div>
    <div class="sl-signature-block">
      <h4>Employee Acceptance</h4>
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
    <p class="sl-legal-note">This confirmation letter forms part of your permanent employment record. Retain a copy for your personal records.</p>
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
      { key: "probation_end_date", label: "Probation End Date", type: "date" },
      { key: "confirmation_date", label: "Confirmation Effective Date", type: "date", auto_fill: "today" },
      { key: "probation_duration", label: "Probation Duration", type: "select", options: ["3-month", "6-month"], default: "3-month" },
      { key: "reports_to", label: "Reports To", type: "text", default: "Department Head" },
      { key: "supervisor_comments", label: "Supervisor's Comments", type: "text", default: "{{employee_name}} has been a valuable addition to the team, demonstrating professionalism, reliability, and a strong work ethic. Their technical skills and willingness to learn have been impressive." },
      { key: "additional_remarks", label: "Additional Remarks", type: "text", default: "Your positive attitude, collaborative spirit, and commitment to excellence have not gone unnoticed. You have quickly become a valued member of our team." },
      { key: "confirmed_salary", label: "Confirmed Monthly Salary (SLE)", type: "number", auto_fill: "employee.base_salary" },
      { key: "payment_date", label: "Payment Date", type: "select", options: ["25th", "Last working day", "1st of following month"], default: "25th" },
      { key: "payment_method", label: "Payment Method", type: "select", options: ["Bank Transfer", "Mobile Money", "Cheque"], default: "Bank Transfer" },
      { key: "salary_increase", label: "Salary Increase", type: "text", default: "No change from probationary salary" },
      { key: "annual_leave_days", label: "Annual Leave Days", type: "select", options: ["21", "25", "30"], default: "21" },
      { key: "notice_period", label: "Notice Period", type: "select", options: ["1 month", "2 months", "3 months"], default: "1 month" },
      { key: "additional_benefits", label: "Additional Benefits", type: "text", default: "Medical insurance enrollment, staff discount scheme, eligibility for performance bonuses, access to training and development programs" },
      { key: "performance_review_frequency", label: "Performance Review Frequency", type: "select", options: ["annually", "bi-annually", "quarterly"], default: "annually" },
      { key: "contract_date", label: "Original Contract Date", type: "date", auto_fill: "employee.hire_date" },
      { key: "next_steps", label: "Next Steps", type: "text", default: "HR will contact you to complete benefits enrollment and provide additional onboarding materials" },
      { key: "signatory_name", label: "Signatory Name", type: "text", default: "HR Director" },
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
    <p class="sl-subtitle">{{company_name}} • Official Termination Notice</p>
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
      <div class="sl-info-item">
        <label>Date of Joining</label>
        <span>{{hire_date}}</span>
      </div>
      <div class="sl-info-item">
        <label>Length of Service</label>
        <span>{{length_of_service}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <p>This letter serves as official notice of the termination of your employment with <strong>{{company_name}}</strong>. This decision has been made in accordance with the terms of your employment contract dated {{contract_date}} and the provisions of the Employment Act 2023 of Sierra Leone.</p>
    <p>We understand that receiving this notice may be difficult, and we are committed to handling this transition with professionalism, dignity, and in full compliance with all legal requirements.</p>
  </div>

  <div class="sl-section">
    <h2>Termination Details</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-color: #64748b;">
      <h3 style="color: #475569;">📋 Employment Termination Summary</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #64748b;">
          <label>Termination Type</label>
          <span>{{termination_type}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #64748b;">
          <label>Notice Date</label>
          <span>{{notice_date}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #64748b;">
          <label>Last Working Day</label>
          <span>{{last_working_day}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #64748b;">
          <label>Notice Period Provided</label>
          <span>{{notice_period}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Reason for Termination</h2>
    <p><strong>Category:</strong> {{termination_category}}</p>
    <p><strong>Details:</strong></p>
    <p>{{termination_reason}}</p>
    <p>{{termination_details}}</p>
  </div>

  <div class="sl-section">
    <h2>Notice Period & Working Arrangements</h2>
    <p>{{notice_working_arrangement}}</p>
    <ul>
      <li>You are required to work your full notice period unless otherwise agreed</li>
      <li>Alternatively, {{garden_leave_option}}</li>
      <li>Payment in lieu of notice {{payment_in_lieu_option}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Final Financial Settlement</h2>
    <p>Your final settlement will include the following entitlements as applicable:</p>
    
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Outstanding Salary</label>
        <span>Up to {{last_working_day}}</span>
      </div>
      <div class="sl-info-item">
        <label>Accrued Leave Payment</label>
        <span>{{accrued_leave_days}} days</span>
      </div>
      <div class="sl-info-item">
        <label>Notice Period Pay</label>
        <span>{{notice_pay_details}}</span>
      </div>
      <div class="sl-info-item">
        <label>Severance (if applicable)</label>
        <span>{{severance_details}}</span>
      </div>
    </div>

    <p style="margin-top: 15px;"><strong>Deductions:</strong></p>
    <ul>
      <li>Statutory deductions: NASSIT (5%), PAYE as applicable</li>
      <li>Any outstanding loans or advances: {{outstanding_amounts}}</li>
      <li>Cost of any unreturned company property (if applicable)</li>
    </ul>

    <p><strong>Payment Schedule:</strong></p>
    <ul>
      <li>Final salary for work performed: Next regular payroll date</li>
      <li>Final settlement (leave, severance, etc.): Within {{settlement_days}} working days of last working day</li>
      <li>Final settlement will be paid to your registered bank account</li>
    </ul>

    <p><strong>NASSIT & Tax Clearance:</strong></p>
    <ul>
      <li>All NASSIT contributions will be finalized and submitted to NASSIT</li>
      <li>PAYE taxes will be calculated and remitted to NRA</li>
      <li>You will receive a statement of NASSIT contributions made during your employment</li>
      <li>Tax certificate (if required) will be provided for your records</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Return of Company Property</h2>
    <p>You are required to return all company property on or before your last working day. This includes but is not limited to:</p>
    
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Identification</label>
        <span>ID card, access cards, security pass</span>
      </div>
      <div class="sl-info-item">
        <label>Equipment</label>
        <span>Laptop, desktop, monitor, keyboard, mouse</span>
      </div>
      <div class="sl-info-item">
        <label>Mobile Devices</label>
        <span>Mobile phone, tablet, accessories</span>
      </div>
      <div class="sl-info-item">
        <label>Keys & Access</label>
        <span>Office keys, vehicle keys, safe keys</span>
      </div>
      <div class="sl-info-item">
        <label>Documents</label>
        <span>Files, records, manuals, notebooks</span>
      </div>
      <div class="sl-info-item">
        <label>Other Property</label>
        <span>Uniform, tools, parking pass, etc.</span>
      </div>
    </div>

    <p style="margin-top: 15px;">Please ensure all items are returned in good working condition. A clearance checklist will be provided to track returns. Failure to return property may result in deductions from final pay or legal action to recover company assets.</p>
  </div>

  <div class="sl-section">
    <h2>Confidentiality & Post-Employment Obligations</h2>
    <p>Please be reminded that the following obligations continue after employment ends:</p>
    <ul>
      <li><strong>Confidentiality:</strong> Your duty to maintain confidentiality of all proprietary and confidential information as per your NDA continues {{nda_duration}}</li>
      <li><strong>Non-Disclosure:</strong> Do not disclose trade secrets, customer lists, business strategies, or any confidential information</li>
      <li><strong>Non-Solicitation:</strong> {{non_solicitation_clause}}</li>
      <li><strong>Intellectual Property:</strong> All work products, inventions, and creations during employment remain company property</li>
      <li><strong>Data Deletion:</strong> Delete all company data from personal devices and accounts</li>
    </ul>
    <p>Breach of post-employment obligations may result in legal action and claims for damages.</p>
  </div>

  <div class="sl-section">
    <h2>Exit Interview & Clearance Process</h2>
    <p>To complete your separation from {{company_name}}, please:</p>
    <ol>
      <li><strong>Schedule Exit Interview:</strong> Contact HR within 3 working days to schedule (contact: {{hr_contact}})</li>
      <li><strong>Complete Clearance Form:</strong> Obtain signatures from all relevant departments</li>
      <li><strong>Return Property:</strong> Return all items as per the checklist provided</li>
      <li><strong>Handover:</strong> Complete handover of all ongoing work, projects, and responsibilities to {{handover_to}}</li>
      <li><strong>Final Meeting:</strong> Attend final meeting with HR to collect service certificate and final documents</li>
    </ol>
  </div>

  <div class="sl-section">
    <h2>Service Certificate</h2>
    <p>Upon completion of exit formalities and return of all company property, you will receive:</p>
    <ul>
      <li>Certificate of Service stating your employment dates and position held</li>
      <li>Statement of NASSIT contributions</li>
      <li>Final payslip and settlement statement</li>
      <li>{{reference_policy}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Benefits & Insurance Cessation</h2>
    <ul>
      <li>Health insurance coverage (if provided) will cease on {{last_working_day}}</li>
      <li>Access to company facilities and systems will be revoked on {{last_working_day}}</li>
      <li>Any company-sponsored benefits will be terminated as per plan rules</li>
      <li>COBRA or continuation options: {{insurance_continuation}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Your Rights Under Employment Act 2023</h2>
    <p>This termination is conducted in accordance with the Employment Act 2023 of Sierra Leone, specifically:</p>
    <ul>
      <li><strong>Section 85:</strong> Notice period requirements based on length of service</li>
      <li><strong>Section 91:</strong> Grounds for termination (if applicable)</li>
      <li><strong>Section 93:</strong> Entitlement to final settlement and accrued benefits</li>
    </ul>

    <p><strong>If You Believe This Termination is Unfair:</strong></p>
    <ul>
      <li>You have the right to request full written reasons for termination</li>
      <li>You may file a complaint with the Ministry of Labour and Social Security</li>
      <li>You have the right to seek legal counsel and advice on your rights</li>
      <li>Unfair dismissal claims must generally be filed within {{unfair_dismissal_claim_days}} days</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Future Employment References</h2>
    <p>{{reference_policy}}</p>
  </div>

  <div class="sl-section" style="background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 3px solid #6b7280;">
    <p>We acknowledge your service to {{company_name}} and the contributions you have made during your time with us. We wish you every success in your future career and personal endeavors.</p>
    <p style="margin-bottom: 0;">If you have any questions regarding this notice, your final settlement, or the exit process, please contact the Human Resources department at {{hr_contact}}.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block" style="max-width: 350px; margin: 0 auto;">
      <h4>For {{company_name}}</h4>
      <p><strong>{{authorized_signatory}}</strong></p>
      <p>{{signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line"></div>
      <p style="font-size: 10px; color: #888; margin-top: 5px;">Authorized Signature & Company Stamp</p>
    </div>
  </div>

  <div class="sl-section" style="margin-top: 40px; background: #fefce8; padding: 20px; border-radius: 8px; border: 1px solid #facc15;">
    <h2 style="color: #a16207; border: none; padding: 0; background: none;">Employee Acknowledgment of Receipt</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have received this Notice of Termination of Employment on the date indicated below. I understand:</p>
    <ul>
      <li>The effective date of termination and my last working day</li>
      <li>The notice period and working arrangements during this period</li>
      <li>My obligation to return all company property</li>
      <li>My continuing obligations regarding confidentiality and non-disclosure</li>
      <li>The details of my final settlement and when it will be paid</li>
      <li>My rights under the Employment Act 2023 of Sierra Leone</li>
    </ul>
    <p style="font-size: 12px; color: #78716c;"><em><strong>Important Note:</strong> Signing this acknowledgment confirms only that you have received and read this notice. It does not indicate agreement with or acceptance of the termination decision. You retain all legal rights to challenge this decision if you believe it is unfair.</em></p>
    
    <div class="sl-info-grid" style="margin-top: 20px;">
      <div class="sl-info-item">
        <label>Employee Signature</label>
        <span>_________________________</span>
      </div>
      <div class="sl-info-item">
        <label>Date Received</label>
        <span>_________________________</span>
      </div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This termination letter is strictly confidential and should be treated as such. Copies will be retained in personnel records as required by law.</p>
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
      { key: "hire_date", label: "Date of Joining", type: "date", auto_fill: "employee.hire_date" },
      { key: "length_of_service", label: "Length of Service", type: "text", default: "3 years 2 months" },
      { key: "contract_date", label: "Employment Contract Date", type: "date", auto_fill: "employee.hire_date" },
      { key: "termination_type", label: "Termination Type", type: "select", options: ["Resignation (Employee Initiated)", "End of Fixed-Term Contract", "Redundancy/Restructuring", "Performance-Based Termination", "Misconduct (With Notice)", "Gross Misconduct (Summary Dismissal)", "Retirement", "Mutual Separation Agreement", "Abandonment of Position"], default: "Performance-Based Termination" },
      { key: "termination_category", label: "Termination Category", type: "select", options: ["Voluntary Separation", "Involuntary Separation", "End of Contract", "Retirement"], default: "Involuntary Separation" },
      { key: "notice_date", label: "Notice Date", type: "date", auto_fill: "today" },
      { key: "last_working_day", label: "Last Working Day", type: "date" },
      { key: "notice_period", label: "Notice Period Given", type: "select", options: ["7 days (probation)", "1 month", "2 months", "3 months", "Immediate (gross misconduct)"], default: "1 month" },
      { key: "termination_reason", label: "Primary Reason for Termination", type: "text", default: "As discussed in detail during your meeting with management and Human Resources on [date]." },
      { key: "termination_details", label: "Additional Details/Context", type: "text", default: "This decision was made after careful consideration and in accordance with company policies and procedures." },
      { key: "notice_working_arrangement", label: "Notice Working Arrangement", type: "select", options: ["You are required to work your full notice period", "You are placed on garden leave for the notice period", "Payment in lieu of notice - you may leave immediately"], default: "You are required to work your full notice period" },
      { key: "garden_leave_option", label: "Garden Leave Option", type: "text", default: "you may be placed on garden leave at the company's discretion" },
      { key: "payment_in_lieu_option", label: "Payment in Lieu Option", type: "text", default: "may be offered at company discretion" },
      { key: "accrued_leave_days", label: "Accrued Leave Days", type: "number", default: "0" },
      { key: "notice_pay_details", label: "Notice Pay Details", type: "text", default: "As per notice period worked/paid" },
      { key: "severance_details", label: "Severance Details", type: "text", default: "Not applicable" },
      { key: "outstanding_amounts", label: "Outstanding Amounts", type: "text", default: "None" },
      { key: "additional_entitlements", label: "Additional Entitlements", type: "text", default: "Pro-rated 13th month salary (if applicable), reimbursement for approved business expenses" },
      { key: "settlement_days", label: "Final Settlement Processing (Days)", type: "select", options: ["7", "14", "21", "30"], default: "14" },
      { key: "nda_duration", label: "NDA Continuation Duration", type: "text", default: "indefinitely for trade secrets, and 2 years for other confidential information" },
      { key: "non_solicitation_clause", label: "Non-Solicitation Terms", type: "text", default: "Do not solicit company employees or customers for 12 months post-termination as per your employment agreement" },
      { key: "hr_contact", label: "HR Contact", type: "text", default: "hr@company.com or +232-XX-XXX-XXX" },
      { key: "handover_to", label: "Handover To", type: "text", default: "your supervisor or designated colleague" },
      { key: "reference_policy", label: "Reference Policy", type: "text", default: "Basic employment references (dates, position) will be provided upon request. Detailed references at manager's discretion." },
      { key: "insurance_continuation", label: "Insurance Continuation", type: "text", default: "Not available. Coverage ends on last working day." },
      { key: "unfair_dismissal_claim_days", label: "Unfair Dismissal Claim Period (Days)", type: "select", options: ["30", "60", "90"], default: "60" },
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