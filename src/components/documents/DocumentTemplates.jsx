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
    <h1>Leave & Time Off Policy</h1>
    <p class="sl-subtitle">{{company_name}} • In accordance with Employment Act 2023 of Sierra Leone</p>
    <p class="sl-ref-number">Ref: LP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose & Scope</h2>
    <p>This Leave Policy establishes the guidelines and procedures for all types of leave at <strong>{{company_name}}</strong>. It is designed to ensure fair and consistent administration of leave entitlements while meeting the statutory requirements of the Employment Act 2023 of Sierra Leone.</p>
    <p>This policy applies to all employees, including permanent, contract, and temporary staff, unless otherwise specified. Leave entitlements may vary based on employment type and length of service.</p>
  </div>

  <div class="sl-section">
    <h2>2. Annual Leave (Vacation Leave)</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfeff 0%, #cffafe 100%); border-color: #0ea5e9;">
      <h3 style="color: #0284c7;">🏖️ Annual Leave Entitlement</h3>
      <p>Per Section 44 of the Employment Act 2023, all employees are entitled to paid annual leave:</p>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Annual Entitlement</label>
          <span>{{annual_leave_days}} working days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Monthly Accrual Rate</label>
          <span>{{monthly_accrual}} days/month</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Eligibility</label>
          <span>After 12 months of continuous service</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #0ea5e9;">
          <label>Leave Year</label>
          <span>{{leave_year}}</span>
        </div>
      </div>
    </div>
    
    <p><strong>2.1 Accrual & Eligibility:</strong></p>
    <ul>
      <li>Annual leave accrues from the first day of employment but becomes available after completing 12 months of continuous service</li>
      <li>Pro-rata entitlement applies for employees who have not completed a full year</li>
      <li>Leave is calculated based on working days (excludes weekends and public holidays)</li>
    </ul>

    <p><strong>2.2 Requesting Annual Leave:</strong></p>
    <ul>
      <li>Submit leave requests at least {{annual_leave_notice}} in advance through the HR system or to your supervisor</li>
      <li>Requests for peak periods (December holidays, Easter) should be submitted at least 1 month in advance</li>
      <li>Leave approval is subject to operational requirements and management discretion</li>
      <li>Employees may request up to {{max_consecutive_days}} consecutive days at one time; longer periods require senior management approval</li>
    </ul>

    <p><strong>2.3 Carry-Forward & Expiry:</strong></p>
    <ul>
      <li>Annual leave should be taken within 12 months of becoming available</li>
      <li>Maximum of {{carry_forward_days}} days may be carried forward to the following year with written management approval</li>
      <li>Carried-forward leave must be used within the first 3 months of the new leave year</li>
      <li>Unused leave beyond the carry-forward limit will be forfeited</li>
      <li>Annual leave cannot normally be converted to cash payment except upon termination of employment</li>
    </ul>

    <p><strong>2.4 Leave During Notice Period:</strong></p>
    <ul>
      <li>Annual leave may be taken during the notice period with management approval</li>
      <li>Outstanding leave may be paid out upon termination at the employer's discretion</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Sick Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #ef4444;">
      <h3 style="color: #dc2626;">🏥 Sick Leave Entitlement</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #ef4444;">
          <label>Paid Sick Days</label>
          <span>{{sick_leave_days}} days per year</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #ef4444;">
          <label>Medical Certificate</label>
          <span>Required for {{medical_cert_days}}+ consecutive days</span>
        </div>
      </div>
    </div>

    <p><strong>3.1 Notification Procedure:</strong></p>
    <ul>
      <li>Notify your supervisor as early as possible on the first day of illness—preferably before your scheduled start time</li>
      <li>If unable to call personally, have a family member or colleague notify on your behalf</li>
      <li>Provide an estimated date of return if possible</li>
      <li>Keep your supervisor updated if your absence extends beyond expected return date</li>
    </ul>

    <p><strong>3.2 Documentation:</strong></p>
    <ul>
      <li>A medical certificate from a registered medical practitioner is required for absences of {{medical_cert_days}} or more consecutive working days</li>
      <li>Medical certificates must state the nature of illness (if appropriate), dates of incapacity, and expected return date</li>
      <li>The company reserves the right to request medical documentation for any absence</li>
    </ul>

    <p><strong>3.3 Extended Sick Leave:</strong></p>
    <ul>
      <li>After exhausting paid sick leave, extended sick leave may be granted at management discretion</li>
      <li>Extended sick leave may be unpaid or partially paid depending on circumstances</li>
      <li>For serious or chronic illness, the company may require an independent medical examination</li>
      <li>Return-to-work clearance may be required for extended illness or certain conditions</li>
    </ul>

    <p><strong>3.4 Abuse of Sick Leave:</strong></p>
    <ul>
      <li>Patterns of sick leave abuse (e.g., frequent Monday/Friday absences) may trigger investigation</li>
      <li>Falsifying sick leave or medical certificates is grounds for disciplinary action</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Maternity Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%); border-color: #a855f7;">
      <h3 style="color: #9333ea;">👶 Maternity Leave (Section 47, Employment Act 2023)</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Total Entitlement</label>
          <span>14 weeks (98 calendar days)</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Pre-Delivery Leave</label>
          <span>Up to 4 weeks before expected due date</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Post-Delivery Minimum</label>
          <span>At least 6 weeks after delivery</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #a855f7;">
          <label>Eligibility</label>
          <span>All female employees</span>
        </div>
      </div>
    </div>

    <p><strong>4.1 Entitlement & Pay:</strong></p>
    <ul>
      <li>First 6 weeks: Full pay (100% of basic salary)</li>
      <li>Remaining 8 weeks: Half pay (50% of basic salary)</li>
      <li>Statutory allowances and benefits continue during maternity leave</li>
    </ul>

    <p><strong>4.2 Notification Requirements:</strong></p>
    <ul>
      <li>Notify HR and your supervisor of pregnancy as soon as reasonably practicable, preferably before the end of the first trimester</li>
      <li>Provide a medical certificate confirming pregnancy and expected due date</li>
      <li>Submit maternity leave application at least 4 weeks before intended start date</li>
      <li>Notify HR of the actual delivery date within 7 days of birth</li>
    </ul>

    <p><strong>4.3 Job Protection:</strong></p>
    <ul>
      <li>Employment is protected during maternity leave as guaranteed by law</li>
      <li>Employees are entitled to return to the same position or equivalent role</li>
      <li>Dismissal during pregnancy or maternity leave (except for gross misconduct) is unlawful</li>
    </ul>

    <p><strong>4.4 Pregnancy-Related Accommodations:</strong></p>
    <ul>
      <li>Reasonable accommodations will be made for pregnant employees (e.g., modified duties, rest breaks)</li>
      <li>Antenatal appointments are permitted with reasonable notice</li>
    </ul>

    <p><strong>4.5 Nursing Breaks:</strong></p>
    <ul>
      <li>Nursing mothers are entitled to {{nursing_break_duration}} paid break(s) during the working day for the first {{nursing_period}} months after returning to work</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Paternity Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-color: #3b82f6;">
      <h3 style="color: #2563eb;">👨‍👧 Paternity Leave</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Entitlement</label>
          <span>{{paternity_leave_days}} working days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Pay</label>
          <span>Full pay (100%)</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Timeframe</label>
          <span>Within {{paternity_timeframe}} of birth</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #3b82f6;">
          <label>Documentation</label>
          <span>Birth certificate required</span>
        </div>
      </div>
    </div>

    <p><strong>5.1 Eligibility & Application:</strong></p>
    <ul>
      <li>Available to all male employees whose spouse or partner gives birth</li>
      <li>Also applies to employees whose child is born via surrogacy or adoption</li>
      <li>Apply through HR with anticipated due date; submit birth certificate upon return</li>
      <li>Leave must be taken within {{paternity_timeframe}} of the child's birth and cannot be split</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Compassionate & Bereavement Leave</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-color: #64748b;">
      <h3 style="color: #475569;">💐 Compassionate Leave Entitlements</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #64748b;">
          <label>Immediate Family Death</label>
          <span>{{compassionate_immediate}} working days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #64748b;">
          <label>Extended Family Death</label>
          <span>{{compassionate_extended}} working days</span>
        </div>
      </div>
    </div>

    <p><strong>6.1 Definitions:</strong></p>
    <ul>
      <li><strong>Immediate Family:</strong> Spouse, child, parent, sibling, grandparent, grandchild</li>
      <li><strong>Extended Family:</strong> In-laws, aunts, uncles, cousins, nieces, nephews</li>
    </ul>

    <p><strong>6.2 Other Compassionate Circumstances:</strong></p>
    <ul>
      <li>Serious illness of immediate family member: Up to 3 days</li>
      <li>Hospitalization of dependent child: Up to 3 days</li>
      <li>Other exceptional circumstances: At management discretion</li>
    </ul>

    <p><strong>6.3 Procedure:</strong></p>
    <ul>
      <li>Notify your supervisor or HR as soon as possible</li>
      <li>Documentary evidence (death certificate, hospital records) may be required</li>
      <li>Additional unpaid leave may be granted for exceptional circumstances</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Public Holidays</h2>
    <p>All employees are entitled to paid leave on official Sierra Leone public holidays as declared by the Government. The standard public holidays include:</p>
    <ul>
      <li>New Year's Day (January 1)</li>
      <li>Independence Day (April 27)</li>
      <li>Good Friday and Easter Monday</li>
      <li>Eid-ul-Fitr and Eid-ul-Adha</li>
      <li>Christmas Day (December 25)</li>
      <li>Boxing Day (December 26)</li>
      <li>Other holidays as declared by the Government</li>
    </ul>

    <p><strong>7.1 Working on Public Holidays:</strong></p>
    <ul>
      <li>Employees required to work on public holidays shall be compensated at <strong>2.5 times</strong> the regular hourly rate</li>
      <li>Alternatively, a compensatory day off may be granted in lieu of overtime pay</li>
      <li>Management will provide reasonable advance notice when holiday work is required</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Study Leave & Examination Leave</h2>
    <ul>
      <li><strong>Approved Studies:</strong> Up to {{study_leave_days}} days per year for job-related education approved by the company</li>
      <li><strong>Examination Leave:</strong> Up to {{exam_leave_days}} days for sitting approved professional examinations</li>
      <li>Prior approval and evidence of enrollment/exam registration required</li>
      <li>May be paid or unpaid depending on relevance to role and company policy</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Marriage Leave</h2>
    <ul>
      <li>Employees are entitled to <strong>{{marriage_leave_days}} working days</strong> of paid leave for their own marriage</li>
      <li>Marriage certificate must be submitted within 30 days of return</li>
      <li>This leave may only be taken once during employment</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Unpaid Leave (Leave of Absence)</h2>
    <ul>
      <li>Unpaid leave may be granted at management discretion for personal reasons not covered by other leave types</li>
      <li>Submit requests in writing at least {{unpaid_leave_notice}} in advance</li>
      <li>Maximum duration: {{max_unpaid_leave}} unless special circumstances apply</li>
      <li>Benefits may be suspended or prorated during extended unpaid leave</li>
      <li>NASSIT contributions will not be made during unpaid leave periods</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Jury Duty & Civic Leave</h2>
    <p>Employees summoned for jury duty or to serve as witnesses in court proceedings shall be granted leave:</p>
    <ul>
      <li>Full pay for the duration of civic duty</li>
      <li>Provide official summons or court documentation</li>
      <li>Return to work promptly when not required at court</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Leave Records & Administration</h2>
    <ul>
      <li>All leave requests and approvals must be documented</li>
      <li>Employees can check their leave balance through the HR system or by contacting HR</li>
      <li>Leave taken without prior approval (except emergencies) may be treated as unauthorized absence</li>
      <li>Unauthorized absence is subject to disciplinary action and salary deduction</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>13. Policy Review</h2>
    <p>This Leave Policy will be reviewed annually and updated as necessary to comply with changes in legislation or company requirements. Employees will be notified of any significant changes.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understand this Leave Policy</li>
      <li>I understand my leave entitlements and the procedures for requesting leave</li>
      <li>I agree to comply with all aspects of this policy</li>
      <li>I understand that failure to follow proper leave procedures may result in disciplinary action</li>
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
    <p class="sl-legal-note">This policy complies with the Employment Act 2023 of Sierra Leone. All leave entitlements meet or exceed statutory minimums.</p>
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
      { key: "monthly_accrual", label: "Monthly Accrual Rate", type: "text", default: "1.75" },
      { key: "leave_year", label: "Leave Year", type: "select", options: ["January - December", "April - March", "July - June"], default: "January - December" },
      { key: "annual_leave_notice", label: "Annual Leave Notice Period", type: "select", options: ["1 week", "2 weeks", "1 month"], default: "2 weeks" },
      { key: "max_consecutive_days", label: "Max Consecutive Days", type: "select", options: ["10", "14", "21"], default: "14" },
      { key: "carry_forward_days", label: "Carry Forward Days", type: "select", options: ["5", "10", "15"], default: "10" },
      { key: "sick_leave_days", label: "Sick Leave Days", type: "select", options: ["5", "10", "12"], default: "5" },
      { key: "medical_cert_days", label: "Days Before Medical Cert Required", type: "select", options: ["2", "3"], default: "2" },
      { key: "nursing_break_duration", label: "Nursing Break Duration", type: "text", default: "two 30-minute" },
      { key: "nursing_period", label: "Nursing Break Period (months)", type: "select", options: ["6", "9", "12"], default: "6" },
      { key: "paternity_leave_days", label: "Paternity Leave Days", type: "select", options: ["5", "7", "10"], default: "5" },
      { key: "paternity_timeframe", label: "Paternity Leave Timeframe", type: "select", options: ["2 weeks", "1 month", "6 weeks"], default: "2 weeks" },
      { key: "compassionate_immediate", label: "Compassionate Leave (Immediate)", type: "select", options: ["3", "5", "7"], default: "5" },
      { key: "compassionate_extended", label: "Compassionate Leave (Extended)", type: "select", options: ["2", "3"], default: "3" },
      { key: "study_leave_days", label: "Study Leave Days", type: "select", options: ["5", "10", "15"], default: "10" },
      { key: "exam_leave_days", label: "Exam Leave Days", type: "select", options: ["3", "5"], default: "3" },
      { key: "marriage_leave_days", label: "Marriage Leave Days", type: "select", options: ["3", "5"], default: "3" },
      { key: "unpaid_leave_notice", label: "Unpaid Leave Notice", type: "select", options: ["1 week", "2 weeks", "1 month"], default: "2 weeks" },
      { key: "max_unpaid_leave", label: "Max Unpaid Leave", type: "select", options: ["1 month", "3 months", "6 months"], default: "3 months" }
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
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">💻</div>
    <h1>Information Technology Acceptable Use Policy</h1>
    <p class="sl-subtitle">{{company_name}} • IT Security & Usage Guidelines</p>
    <p class="sl-ref-number">Ref: ITAUP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Introduction & Purpose</h2>
    <p><strong>{{company_name}}</strong> provides employees with access to various information technology resources to enable them to perform their job duties effectively. These resources represent a significant investment and are critical to our business operations.</p>
    <p>This IT Acceptable Use Policy ("Policy") establishes guidelines and rules for the appropriate use of {{company_name}}'s technology resources. The purpose of this Policy is to:</p>
    <ul>
      <li>Protect the company's IT infrastructure, data, and systems from misuse, damage, or security threats</li>
      <li>Ensure compliance with applicable laws and regulations</li>
      <li>Maintain a productive and professional work environment</li>
      <li>Protect the company's reputation and intellectual property</li>
      <li>Safeguard employee and customer data privacy</li>
    </ul>
    <p>All users of company IT resources are expected to exercise good judgment, act responsibly, and comply with this Policy at all times.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope & Applicability</h2>
    <p>This Policy applies to:</p>
    <ul>
      <li>All employees, contractors, consultants, temporary staff, and interns</li>
      <li>Any person who has been granted access to {{company_name}}'s IT systems</li>
      <li>All company-owned, leased, or managed IT equipment and services</li>
    </ul>

    <p><strong>Covered Resources Include:</strong></p>
    <div class="sl-info-grid">
      <div class="sl-info-item" style="border-left-color: #6366f1;">
        <label>Hardware</label>
        <span>Computers, laptops, tablets, mobile devices, printers, servers</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #6366f1;">
        <label>Software</label>
        <span>Operating systems, applications, licensed programs</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #6366f1;">
        <label>Networks</label>
        <span>LAN, WAN, Wi-Fi, VPN, internet access</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #6366f1;">
        <label>Communications</label>
        <span>Email, instant messaging, video conferencing, phone systems</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #6366f1;">
        <label>Data & Storage</label>
        <span>Files, databases, cloud storage, backup systems</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #6366f1;">
        <label>BYOD</label>
        <span>Personal devices used for work purposes</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>3. Acceptable Use</h2>
    <p>Company IT resources are provided primarily for business purposes. Acceptable use includes:</p>
    <ul>
      <li><strong>Job-Related Activities:</strong> Performing assigned duties, accessing work systems, communicating with colleagues and clients</li>
      <li><strong>Professional Development:</strong> Training, research, and learning activities relevant to your role</li>
      <li><strong>Limited Personal Use:</strong> Brief personal activities (email, internet browsing) during breaks, provided they do not:
        <ul>
          <li>Interfere with work duties or productivity</li>
          <li>Consume excessive bandwidth or system resources</li>
          <li>Violate any company policies or laws</li>
          <li>Create additional costs for the company</li>
        </ul>
      </li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Prohibited Activities</h2>
    <div class="sl-highlight-box" style="background: #fef2f2; border-color: #dc2626;">
      <h3 style="color: #dc2626;">🚫 Strictly Prohibited Activities</h3>
      <p>The following activities are expressly forbidden and may result in immediate disciplinary action:</p>
    </div>

    <p><strong>4.1 Security Violations:</strong></p>
    <ul>
      <li>Attempting to bypass, disable, or circumvent security controls, firewalls, or access restrictions</li>
      <li>Accessing or attempting to access systems, files, or data you are not authorized to use</li>
      <li>Sharing your login credentials, passwords, or security tokens with anyone</li>
      <li>Using another person's account or credentials without explicit authorization</li>
      <li>Introducing malware, viruses, or malicious code into company systems</li>
      <li>Connecting unauthorized devices, networks, or storage media to company systems</li>
      <li>Installing unauthorized software, applications, or browser extensions</li>
    </ul>

    <p><strong>4.2 Illegal & Unethical Activities:</strong></p>
    <ul>
      <li>Accessing, downloading, storing, or distributing pornographic, sexually explicit, or obscene material</li>
      <li>Accessing or distributing content that promotes violence, hatred, or discrimination</li>
      <li>Engaging in any activity that violates local, national, or international laws</li>
      <li>Downloading, copying, or distributing copyrighted materials (music, movies, software) without authorization</li>
      <li>Engaging in software piracy or using unlicensed software</li>
      <li>Gambling or accessing gambling websites</li>
      <li>Engaging in cryptocurrency mining using company resources</li>
    </ul>

    <p><strong>4.3 Harassment & Abuse:</strong></p>
    <ul>
      <li>Using IT systems to harass, threaten, intimidate, or bully any person</li>
      <li>Sending offensive, defamatory, or discriminatory messages</li>
      <li>Stalking or cyberstalking individuals</li>
      <li>Creating a hostile work environment through electronic communications</li>
    </ul>

    <p><strong>4.4 Commercial & Personal Gain:</strong></p>
    <ul>
      <li>Using company resources for personal business ventures or commercial activities</li>
      <li>Selling products or services using company systems</li>
      <li>Engaging in any activity for personal financial gain</li>
      <li>Using company resources for political activities or campaigning</li>
    </ul>

    <p><strong>4.5 Data & Confidentiality Violations:</strong></p>
    <ul>
      <li>Disclosing confidential, proprietary, or sensitive information through unsecured channels</li>
      <li>Transferring company data to unauthorized personal accounts or devices</li>
      <li>Accessing customer, employee, or financial data without legitimate business need</li>
      <li>Failing to properly protect sensitive information</li>
    </ul>

    <p><strong>4.6 System Misuse:</strong></p>
    <ul>
      <li>Sending spam, chain letters, or bulk unsolicited messages</li>
      <li>Forwarding hoaxes, phishing attempts, or misleading information</li>
      <li>Deliberately wasting system resources or bandwidth</li>
      <li>Interfering with or disrupting other users' access to systems</li>
      <li>Modifying or tampering with system configurations without authorization</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Email & Electronic Communications</h2>
    <p><strong>5.1 Professional Standards:</strong></p>
    <ul>
      <li>Use clear, professional language in all business communications</li>
      <li>Include appropriate greetings, signatures, and contact information</li>
      <li>Use descriptive subject lines that accurately reflect message content</li>
      <li>Be mindful that emails may be forwarded and could be read by unintended recipients</li>
      <li>Do not use ALL CAPS (considered shouting) or excessive punctuation</li>
    </ul>

    <p><strong>5.2 Security Practices:</strong></p>
    <ul>
      <li>Do not open attachments or click links from unknown or suspicious senders</li>
      <li>Report phishing attempts and suspicious emails to {{it_contact}} immediately</li>
      <li>Verify sender identity before responding to requests for sensitive information or money transfers</li>
      <li>Use encrypted email when sending confidential information</li>
      <li>Do not auto-forward company emails to personal accounts</li>
    </ul>

    <p><strong>5.3 Retention & Ownership:</strong></p>
    <ul>
      <li>Company email is the property of {{company_name}}</li>
      <li>Email may be retained, archived, and accessed by the company for business purposes</li>
      <li>Employees should not have an expectation of privacy in company email</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Internet Usage</h2>
    <p><strong>6.1 Appropriate Use:</strong></p>
    <ul>
      <li>Internet access is provided for work-related activities</li>
      <li>Brief personal browsing during breaks is permitted within the bounds of this Policy</li>
      <li>Streaming video or music for personal entertainment is discouraged as it consumes bandwidth</li>
    </ul>

    <p><strong>6.2 Restricted Sites:</strong></p>
    <ul>
      <li>The company may block access to certain website categories deemed inappropriate or high-risk</li>
      <li>Attempts to bypass website filters using proxies or VPNs are prohibited</li>
      <li>Categories typically blocked include: adult content, gambling, malware sites, illegal downloads</li>
    </ul>

    <p><strong>6.3 Downloads:</strong></p>
    <ul>
      <li>Download files only from trusted, legitimate sources</li>
      <li>Do not download executable files (.exe, .bat, .msi) without IT approval</li>
      <li>All downloads are subject to antivirus scanning</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Password & Authentication Security</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #059669;">
      <h3 style="color: #059669;">🔐 Password Requirements</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Minimum Length</label>
          <span>{{password_min_length}} characters</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Complexity</label>
          <span>Letters, numbers, and symbols required</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Change Frequency</label>
          <span>Every {{password_change_days}} days</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>History</label>
          <span>Cannot reuse last {{password_history}} passwords</span>
        </div>
      </div>
    </div>

    <p><strong>7.1 Password Best Practices:</strong></p>
    <ul>
      <li>Create unique passwords for each system—do not reuse passwords</li>
      <li>Use passphrases (combination of words) for easier memorization with high security</li>
      <li>Never write passwords down or store them in plain text files</li>
      <li>Use a company-approved password manager if available</li>
      <li>Never share your password with anyone, including IT staff (they will never ask for it)</li>
    </ul>

    <p><strong>7.2 Account Security:</strong></p>
    <ul>
      <li>Lock your computer (Windows+L or Cmd+Ctrl+Q) whenever you step away from your desk</li>
      <li>Enable auto-lock after {{auto_lock_minutes}} minutes of inactivity</li>
      <li>Log out of systems when work is complete</li>
      <li>Use multi-factor authentication (MFA) where available</li>
      <li>Report suspicious account activity immediately</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Data Protection & Handling</h2>
    <p><strong>8.1 Data Classification:</strong></p>
    <ul>
      <li><strong>Public:</strong> Information that can be freely shared</li>
      <li><strong>Internal:</strong> For internal use only, not to be shared externally</li>
      <li><strong>Confidential:</strong> Sensitive business information requiring protection</li>
      <li><strong>Restricted:</strong> Highly sensitive data (personal data, financial records) with strict access controls</li>
    </ul>

    <p><strong>8.2 Data Handling Rules:</strong></p>
    <ul>
      <li>Store company data only on approved company systems (not personal devices unless authorized)</li>
      <li>Use encryption when storing or transmitting sensitive data</li>
      <li>Do not send confidential data via unencrypted email</li>
      <li>Follow data backup procedures to prevent data loss</li>
      <li>Properly dispose of sensitive documents (shredding) and securely delete digital files</li>
    </ul>

    <p><strong>8.3 External Transfers:</strong></p>
    <ul>
      <li>Only share data with external parties when there is a legitimate business need</li>
      <li>Use secure file transfer methods for sensitive data</li>
      <li>Ensure appropriate agreements (NDAs, data processing agreements) are in place</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Mobile Devices & BYOD</h2>
    <p><strong>9.1 Company-Issued Devices:</strong></p>
    <ul>
      <li>Use company devices primarily for business purposes</li>
      <li>Install security updates promptly when notified</li>
      <li>Report lost or stolen devices immediately to {{it_contact}}</li>
      <li>Do not modify device configurations or "jailbreak/root" devices</li>
      <li>Return devices upon termination of employment</li>
    </ul>

    <p><strong>9.2 Personal Devices (BYOD):</strong></p>
    <ul>
      <li>Personal devices may only access company systems with prior IT approval</li>
      <li>Security requirements (passcode, encryption, MDM software) must be met</li>
      <li>The company may remotely wipe company data from personal devices if lost or upon termination</li>
      <li>Personal device use is at the employee's own risk</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Social Media Guidelines</h2>
    <ul>
      <li>Do not disclose confidential company information on social media platforms</li>
      <li>When discussing work or industry topics, clearly state opinions are your own</li>
      <li>Do not use company logos, branding, or trademarks without marketing approval</li>
      <li>Be professional and respectful—your online presence reflects on the company</li>
      <li>Do not engage in arguments or negative discussions about the company or competitors</li>
      <li>Report any brand impersonation or defamation you discover</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Software & Licensing</h2>
    <ul>
      <li>Only use software that is properly licensed and approved by the company</li>
      <li>Do not install unauthorized software, including freeware and shareware, without IT approval</li>
      <li>Do not copy or distribute licensed software</li>
      <li>Report any suspected software licensing violations</li>
      <li>Use cloud services only if approved by IT</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Remote Work Security</h2>
    <p>When working remotely:</p>
    <ul>
      <li>Use only approved VPN connections to access company systems</li>
      <li>Ensure your home Wi-Fi network is secured with WPA2/WPA3 encryption and a strong password</li>
      <li>Do not use public Wi-Fi for accessing company systems unless using VPN</li>
      <li>Maintain physical security of devices—do not leave them unattended in public</li>
      <li>Ensure work area is private when handling confidential information</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>13. Incident Reporting</h2>
    <p>Report the following incidents immediately to {{it_contact}}:</p>
    <ul>
      <li>Lost or stolen devices containing company data</li>
      <li>Suspected security breaches or unauthorized access</li>
      <li>Suspicious emails, phishing attempts, or scam calls</li>
      <li>Malware infections or unusual system behavior</li>
      <li>Data breaches or accidental disclosure of confidential information</li>
      <li>Any violations of this Policy that you observe</li>
    </ul>
    <p>Prompt reporting helps minimize damage and is not punitive—employees are encouraged to report without fear of reprisal when acting in good faith.</p>
  </div>

  <div class="sl-section">
    <h2>14. Monitoring & Auditing</h2>
    <p>{{company_name}} reserves the right to monitor all use of company IT resources without prior notice. Monitoring may include:</p>
    <ul>
      <li>Email content and metadata</li>
      <li>Internet browsing history and patterns</li>
      <li>File access and transfers</li>
      <li>System login and activity logs</li>
      <li>Network traffic analysis</li>
      <li>Security scans and vulnerability assessments</li>
    </ul>
    <p><strong>Employees should have no expectation of privacy when using company IT systems.</strong> Monitoring is conducted to protect company assets, ensure compliance, and investigate suspected violations.</p>
  </div>

  <div class="sl-section">
    <h2>15. Consequences of Violations</h2>
    <p>Violations of this IT Acceptable Use Policy are serious matters and may result in:</p>
    <ul>
      <li><strong>Verbal or Written Warning:</strong> For minor or first-time violations</li>
      <li><strong>Suspension of IT Access:</strong> Temporary restriction of system privileges</li>
      <li><strong>Disciplinary Action:</strong> Formal proceedings as per company Disciplinary Policy</li>
      <li><strong>Termination of Employment:</strong> For serious or repeated violations</li>
      <li><strong>Civil or Criminal Action:</strong> Where violations involve illegal activity, the company may report to authorities and pursue legal remedies</li>
      <li><strong>Financial Liability:</strong> Employees may be held liable for damages caused by intentional violations</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>16. Policy Updates</h2>
    <p>This Policy will be reviewed {{review_frequency}} and updated as necessary to address new technologies, threats, and regulatory requirements. Employees will be notified of significant changes and may be required to re-acknowledge the updated Policy.</p>
    <p><strong>Policy Version:</strong> {{policy_version}}<br/>
    <strong>Effective Date:</strong> {{effective_date}}</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understand this IT Acceptable Use Policy</li>
      <li>I agree to comply with all provisions of this Policy</li>
      <li>I understand that company IT resources are provided for business purposes and are the property of the company</li>
      <li>I understand that my use of company IT resources may be monitored</li>
      <li>I understand the security requirements including password policies and data protection</li>
      <li>I will report security incidents and violations promptly</li>
      <li>I understand that violation of this Policy may result in disciplinary action, up to and including termination of employment</li>
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
    <p class="sl-legal-note">This policy protects company assets and ensures safe, responsible use of technology. For IT support, contact {{it_contact}}.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "it_contact", label: "IT Contact", type: "text", default: "IT Support / IT Department" },
      { key: "password_min_length", label: "Minimum Password Length", type: "select", options: ["8", "10", "12"], default: "8" },
      { key: "password_change_days", label: "Password Change Frequency (Days)", type: "select", options: ["30", "60", "90", "180"], default: "90" },
      { key: "password_history", label: "Password History Count", type: "select", options: ["3", "5", "10"], default: "5" },
      { key: "auto_lock_minutes", label: "Auto-Lock (Minutes)", type: "select", options: ["3", "5", "10", "15"], default: "5" },
      { key: "review_frequency", label: "Review Frequency", type: "select", options: ["annually", "every 6 months"], default: "annually" },
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
    <p class="sl-subtitle">{{company_name}} • Fair and Consistent Workplace Standards</p>
    <p class="sl-ref-number">Ref: DP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Introduction & Purpose</h2>
    <p>This Disciplinary Policy establishes a fair, consistent, and legally compliant framework for managing employee conduct and performance issues at <strong>{{company_name}}</strong>. The policy is designed to:</p>
    <ul>
      <li>Ensure all employees are treated fairly, consistently, and without discrimination</li>
      <li>Clarify expected standards of conduct and performance</li>
      <li>Provide a structured process for addressing misconduct and poor performance</li>
      <li>Protect the rights of employees while maintaining organizational standards</li>
      <li>Comply with the Employment Act 2023 of Sierra Leone and principles of natural justice</li>
      <li>Encourage improvement and rehabilitation where possible</li>
    </ul>
    <p>{{company_name}} is committed to resolving issues through informal means where possible. Formal disciplinary action will only be taken when necessary and proportionate to the circumstances.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope & Application</h2>
    <p>This policy applies to:</p>
    <ul>
      <li>All employees of {{company_name}}, including permanent, temporary, fixed-term, and casual staff</li>
      <li>All levels of the organization, from entry-level to senior management</li>
      <li>Conduct during and outside of work hours if it affects the employment relationship or company reputation</li>
    </ul>
    <p>Separate procedures may apply to employees during their probationary period. Contractors and consultants are subject to the terms of their engagement agreements.</p>
  </div>

  <div class="sl-section">
    <h2>3. Principles of Fair Procedure</h2>
    <p>All disciplinary matters will be handled in accordance with these principles:</p>
    <ul>
      <li><strong>Investigation Before Action:</strong> No disciplinary action will be taken without a proper investigation of the facts</li>
      <li><strong>Right to Know:</strong> Employees will be informed of allegations against them in writing before any hearing</li>
      <li><strong>Right to Respond:</strong> Employees will have the opportunity to state their case before any decision is made</li>
      <li><strong>Right to Representation:</strong> Employees may be accompanied by a colleague or union representative at disciplinary hearings</li>
      <li><strong>Impartiality:</strong> Decisions will be made by persons not directly involved in the alleged misconduct</li>
      <li><strong>Proportionality:</strong> Disciplinary action will be proportionate to the severity of the offense</li>
      <li><strong>Consistency:</strong> Similar cases will be treated in a similar manner</li>
      <li><strong>Right to Appeal:</strong> Employees have the right to appeal disciplinary decisions</li>
      <li><strong>Presumption of Innocence:</strong> Employees are presumed innocent until findings are determined</li>
      <li><strong>Confidentiality:</strong> Disciplinary matters will be kept confidential to those involved</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Standards of Conduct & Performance</h2>
    <p>All employees are expected to:</p>
    <ul>
      <li>Comply with all company policies, procedures, and rules</li>
      <li>Follow reasonable and lawful instructions from management</li>
      <li>Perform their duties to an acceptable standard</li>
      <li>Attend work regularly and punctually</li>
      <li>Treat colleagues, customers, and stakeholders with respect</li>
      <li>Act honestly and with integrity</li>
      <li>Maintain confidentiality of company information</li>
      <li>Take reasonable care of company property and resources</li>
      <li>Comply with health, safety, and security requirements</li>
    </ul>
    <p>The Employee Code of Conduct and other company policies provide detailed guidance on expected behavior.</p>
  </div>

  <div class="sl-section">
    <h2>5. Categories of Misconduct</h2>
    
    <div class="sl-highlight-box" style="background: #fef3c7; border-color: #f59e0b;">
      <h3 style="color: #d97706;">5.1 Minor Misconduct</h3>
      <p>Misconduct that is relatively minor and does not normally warrant more than a warning. Examples include:</p>
      <ul>
        <li>Occasional lateness or poor timekeeping</li>
        <li>Short unauthorized absences</li>
        <li>Minor breach of company rules or procedures</li>
        <li>Unsatisfactory work performance (where not due to lack of capability)</li>
        <li>Inappropriate language or behavior (first occurrence, not severe)</li>
        <li>Minor dress code violations</li>
        <li>Minor misuse of company resources</li>
        <li>Failure to follow reasonable instructions (first occurrence)</li>
        <li>Negligence causing minor damage</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="background: #fed7aa; border-color: #ea580c; margin-top: 15px;">
      <h3 style="color: #c2410c;">5.2 Serious Misconduct</h3>
      <p>Conduct that is serious but may not necessarily warrant dismissal for a first offense:</p>
      <ul>
        <li>Repeated minor misconduct after previous warnings</li>
        <li>Persistent lateness or absenteeism</li>
        <li>Insubordination or refusal to carry out lawful instructions</li>
        <li>Negligence causing significant damage or loss</li>
        <li>Unauthorized disclosure of confidential information (not resulting in significant harm)</li>
        <li>Breach of safety rules (not endangering life)</li>
        <li>Misuse of company property or equipment</li>
        <li>Unauthorized absence without reasonable excuse</li>
        <li>Offensive behavior or language causing distress</li>
      </ul>
    </div>

    <div class="sl-highlight-box" style="background: #fee2e2; border-color: #dc2626; margin-top: 15px;">
      <h3 style="color: #b91c1c;">5.3 Gross Misconduct (Per Section 91, Employment Act 2023)</h3>
      <p>Conduct so serious that it fundamentally undermines the employment relationship and may justify summary dismissal without prior warnings. Examples include:</p>
      <ul>
        <li><strong>Theft, fraud, or dishonesty:</strong> Stealing from the company, employees, or customers; fraudulent expense claims; falsifying records</li>
        <li><strong>Violence or threats:</strong> Physical assault, fighting, threats of violence, or intimidation</li>
        <li><strong>Serious harassment or discrimination:</strong> Sexual harassment, racial harassment, bullying causing significant harm</li>
        <li><strong>Serious insubordination:</strong> Willful refusal to obey reasonable and lawful instructions</li>
        <li><strong>Gross negligence:</strong> Actions causing serious harm to persons, property, or the business</li>
        <li><strong>Being under the influence:</strong> Being intoxicated by alcohol or illegal drugs at work</li>
        <li><strong>Possession or use of illegal drugs:</strong> On company premises or during work activities</li>
        <li><strong>Deliberate damage:</strong> Intentional destruction or sabotage of company property</li>
        <li><strong>Serious breach of confidentiality:</strong> Disclosure of trade secrets or sensitive information causing harm</li>
        <li><strong>Serious health and safety violations:</strong> Actions endangering life or causing serious injury</li>
        <li><strong>Criminal conduct:</strong> Conviction for a criminal offense that affects your suitability for employment</li>
        <li><strong>Serious breach of trust:</strong> Actions fundamentally incompatible with the duties of your position</li>
        <li><strong>Bribery or corruption:</strong> Offering, receiving, or soliciting bribes or kickbacks</li>
      </ul>
      <p style="margin-top: 10px;"><em>This list is not exhaustive. Other actions of similar severity may also constitute gross misconduct.</em></p>
    </div>
  </div>

  <div class="sl-section">
    <h2>6. Informal Resolution</h2>
    <p>Where appropriate, minor issues may be resolved informally through:</p>
    <ul>
      <li>A private conversation between the supervisor and employee</li>
      <li>Coaching or guidance on expected standards</li>
      <li>Informal counseling session</li>
      <li>Clear explanation of expectations and agreed improvement actions</li>
    </ul>
    <p>Informal discussions are not disciplinary action and will not be recorded as warnings. However, a note of the discussion may be kept for reference. If informal resolution is unsuccessful, formal disciplinary procedures may be initiated.</p>
  </div>

  <div class="sl-section">
    <h2>7. Formal Disciplinary Stages</h2>
    <p>When formal disciplinary action is warranted, the following stages apply:</p>
    
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

    <p><strong>Stage 1 - Verbal Warning:</strong></p>
    <ul>
      <li>Issued for minor first-time offenses</li>
      <li>Given verbally but recorded in writing for the employee's file</li>
      <li>Employee will be told clearly what improvement is expected</li>
      <li>Valid for {{verbal_warning_period}} months</li>
    </ul>

    <p><strong>Stage 2 - First Written Warning:</strong></p>
    <ul>
      <li>Issued for repeated minor misconduct or more serious first-time offenses</li>
      <li>Given in writing, stating the offense and required improvements</li>
      <li>Employee must sign to acknowledge receipt</li>
      <li>Valid for {{written_warning_period}} months</li>
    </ul>

    <p><strong>Stage 3 - Final Written Warning:</strong></p>
    <ul>
      <li>Issued for continued misconduct after previous warnings, or for serious misconduct</li>
      <li>Clearly states that further misconduct may result in dismissal</li>
      <li>Valid for {{final_warning_period}} months</li>
    </ul>

    <p><strong>Stage 4 - Dismissal:</strong></p>
    <ul>
      <li>Considered when all previous stages have failed to correct behavior, or for gross misconduct</li>
      <li>Dismissal with notice for non-gross misconduct cases</li>
      <li>Summary dismissal (without notice) may apply for gross misconduct as per Section 91 of Employment Act 2023</li>
    </ul>

    <p><strong>Important Notes:</strong></p>
    <ul>
      <li>Stages may be skipped depending on the severity of the offense</li>
      <li>Gross misconduct may result in immediate dismissal without progressing through earlier stages</li>
      <li>Alternatives to dismissal (e.g., demotion, transfer, suspension) may be considered where appropriate</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Disciplinary Investigation</h2>
    <p>Before any disciplinary action is taken, an investigation will be conducted:</p>
    <ol>
      <li><strong>Appointment of Investigator:</strong> A suitable person (usually HR or a manager not involved in the matter) will be appointed</li>
      <li><strong>Gathering Evidence:</strong> The investigator will collect relevant information, documents, and statements</li>
      <li><strong>Interviews:</strong> The investigator may interview the employee, witnesses, and other relevant persons</li>
      <li><strong>Investigation Report:</strong> A written report summarizing findings will be prepared</li>
      <li><strong>Recommendation:</strong> The investigator will recommend whether disciplinary proceedings should continue</li>
    </ol>
    <p>The investigation should be completed within {{investigation_timeline}} where possible. The employee under investigation will be informed of the allegations and given an opportunity to respond.</p>
  </div>

  <div class="sl-section">
    <h2>9. Suspension Pending Investigation</h2>
    <p>In cases of alleged gross misconduct or where the employee's presence may compromise the investigation:</p>
    <ul>
      <li>The employee may be suspended on full pay pending investigation</li>
      <li>Suspension is not a disciplinary sanction and does not imply guilt</li>
      <li>Suspension will be confirmed in writing, stating the reason and expected duration</li>
      <li>During suspension, the employee may be required to:
        <ul>
          <li>Remain available for investigation interviews</li>
          <li>Not contact witnesses or colleagues about the matter</li>
          <li>Not attend the workplace without prior permission</li>
          <li>Return company property if requested</li>
        </ul>
      </li>
      <li>Suspension will be kept as brief as possible and reviewed regularly</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Disciplinary Hearing</h2>
    <p>If the investigation finds there is a case to answer:</p>
    
    <p><strong>10.1 Before the Hearing:</strong></p>
    <ul>
      <li>The employee will receive written notice at least {{hearing_notice_days}} before the hearing</li>
      <li>The notice will state: the allegations, date/time/location of hearing, right to be accompanied</li>
      <li>Copies of relevant evidence will be provided in advance</li>
    </ul>

    <p><strong>10.2 At the Hearing:</strong></p>
    <ul>
      <li>The allegations and evidence will be presented</li>
      <li>The employee will have the opportunity to respond and present their case</li>
      <li>The employee may be accompanied by a colleague or union representative</li>
      <li>The hearing will be chaired by a manager with authority to make decisions</li>
      <li>A note-taker may be present to record proceedings</li>
      <li>Both sides may call witnesses</li>
      <li>The hearing may be adjourned for further investigation if new evidence emerges</li>
    </ul>

    <p><strong>10.3 After the Hearing:</strong></p>
    <ul>
      <li>The decision-maker will consider all evidence before reaching a decision</li>
      <li>The decision will be communicated in writing within {{decision_days}} working days</li>
      <li>The letter will state the decision, reasons, any sanctions, and right of appeal</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Possible Outcomes & Sanctions</h2>
    <p>Following a disciplinary hearing, the following outcomes are possible:</p>
    <ul>
      <li><strong>No Action:</strong> Allegations not substantiated; no disciplinary record</li>
      <li><strong>Management Advice:</strong> Informal advice on conduct/performance without formal warning</li>
      <li><strong>Verbal Warning:</strong> Recorded on file for {{verbal_warning_period}} months</li>
      <li><strong>First Written Warning:</strong> Recorded on file for {{written_warning_period}} months</li>
      <li><strong>Final Written Warning:</strong> Recorded on file for {{final_warning_period}} months</li>
      <li><strong>Demotion:</strong> Reduction in grade, responsibilities, or pay (with employee consent where possible)</li>
      <li><strong>Transfer:</strong> Movement to a different department or location</li>
      <li><strong>Suspension Without Pay:</strong> For a defined period (used sparingly)</li>
      <li><strong>Dismissal With Notice:</strong> Termination with contractual notice period served or paid in lieu</li>
      <li><strong>Summary Dismissal:</strong> Immediate termination without notice for gross misconduct</li>
    </ul>
    <p>The sanction will be proportionate to the offense, taking into account:</p>
    <ul>
      <li>Severity of the misconduct</li>
      <li>Employee's disciplinary record and length of service</li>
      <li>Whether the employee has shown remorse</li>
      <li>Any mitigating circumstances</li>
      <li>How similar cases have been treated previously</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Appeals</h2>
    <p>Employees have the right to appeal any formal disciplinary decision:</p>
    <ul>
      <li>Appeals must be submitted in writing to {{appeal_authority}} within {{appeal_days}} working days of receiving the decision</li>
      <li>The appeal should state the grounds for appeal (e.g., unfairness, new evidence, excessive sanction)</li>
      <li>The appeal will be heard by a more senior manager or panel not previously involved</li>
      <li>The employee may be accompanied at the appeal hearing</li>
      <li>The appeal decision is final and will be communicated in writing within {{appeal_decision_days}} working days</li>
      <li>The appeal may uphold, reduce, or overturn the original decision (it will not increase the sanction)</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>13. Warning Validity & Expiry</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item" style="border-left-color: #fbbf24;">
        <label>Verbal Warning Validity</label>
        <span>{{verbal_warning_period}} months</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #f97316;">
        <label>Written Warning Validity</label>
        <span>{{written_warning_period}} months</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #ef4444;">
        <label>Final Warning Validity</label>
        <span>{{final_warning_period}} months</span>
      </div>
    </div>
    <p>After the specified period, if no further issues have occurred, warnings are considered "spent" and will not normally be taken into account for future disciplinary matters. However:</p>
    <ul>
      <li>Records remain in the personnel file for historical reference</li>
      <li>Patterns of similar behavior may be considered even after warnings expire</li>
      <li>Expired warnings may be referenced in exceptional circumstances</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>14. Managing Poor Performance</h2>
    <p>Where poor performance is due to lack of capability (rather than willful misconduct), a separate Performance Improvement Process may apply:</p>
    <ul>
      <li>Clear identification of performance gaps</li>
      <li>Setting of SMART objectives and targets</li>
      <li>Provision of training, support, and resources</li>
      <li>Regular review meetings during improvement period</li>
      <li>Reasonable time to demonstrate improvement</li>
    </ul>
    <p>If improvement is not achieved despite support, the matter may transition to the disciplinary process.</p>
  </div>

  <div class="sl-section">
    <h2>15. Record Keeping</h2>
    <ul>
      <li>All disciplinary records will be kept confidential and stored securely</li>
      <li>Access to disciplinary files is restricted to HR and relevant management</li>
      <li>Employees may request access to their own disciplinary records</li>
      <li>Records will be retained in accordance with legal requirements and company policy</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>16. Special Circumstances</h2>
    <p><strong>16.1 Criminal Proceedings:</strong> If an employee faces criminal charges, disciplinary proceedings may proceed independently. A criminal conviction is not required for disciplinary action.</p>
    <p><strong>16.2 Long-Term Absence:</strong> If an employee is absent due to illness during proceedings, reasonable adjustments will be made. Proceedings may be delayed or conducted in the employee's absence if delay would be unreasonable.</p>
    <p><strong>16.3 Resignation:</strong> If an employee resigns during disciplinary proceedings, the company may continue to completion. The outcome may be referenced in future employment references.</p>
  </div>

  <div class="sl-section">
    <h2>17. Policy Review</h2>
    <p>This Disciplinary Policy will be reviewed {{review_frequency}} or when significant changes in legislation occur. Employees will be notified of any amendments.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge that:</p>
    <ul>
      <li>I have received, read, and fully understand this Disciplinary Policy</li>
      <li>I understand the standards of conduct expected of me</li>
      <li>I understand the types of misconduct and their potential consequences</li>
      <li>I understand my rights during any disciplinary procedure, including the right to representation and appeal</li>
      <li>I agree to comply with all company policies and rules</li>
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
    <p class="sl-legal-note">This policy complies with the Employment Act 2023 of Sierra Leone. Fair treatment and due process are guaranteed.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "verbal_warning_period", label: "Verbal Warning Period (Months)", type: "select", options: ["3", "6", "9"], default: "6" },
      { key: "written_warning_period", label: "Written Warning Period (Months)", type: "select", options: ["6", "12", "18"], default: "12" },
      { key: "final_warning_period", label: "Final Warning Period (Months)", type: "select", options: ["12", "18", "24"], default: "24" },
      { key: "investigation_timeline", label: "Investigation Timeline", type: "select", options: ["5 working days", "10 working days", "15 working days"], default: "10 working days" },
      { key: "hearing_notice_days", label: "Hearing Notice Period (Days)", type: "select", options: ["2", "3", "5"], default: "3" },
      { key: "decision_days", label: "Decision Notification (Days)", type: "select", options: ["3", "5", "7"], default: "5" },
      { key: "appeal_days", label: "Appeal Period (Days)", type: "select", options: ["5", "7", "10"], default: "7" },
      { key: "appeal_decision_days", label: "Appeal Decision (Days)", type: "select", options: ["5", "7", "10"], default: "7" },
      { key: "appeal_authority", label: "Appeal Authority", type: "text", default: "Managing Director or HR Director" },
      { key: "review_frequency", label: "Review Frequency", type: "select", options: ["annually", "every 2 years"], default: "annually" }
    ]
  },

  remote_work_policy: {
    name: "Remote Work Policy",
    content: `
<div class="sl-document">
  <div class="sl-watermark">POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);">🏠</div>
    <h1>Remote Work & Flexible Working Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Enabling Productivity Anywhere</p>
    <p class="sl-ref-number">Ref: RWP-{{document_ref}}</p>
  </div>

  <div class="sl-section">
    <h2>1. Introduction & Purpose</h2>
    <p><strong>{{company_name}}</strong> recognizes that flexible work arrangements can enhance employee work-life balance, productivity, and job satisfaction while meeting business needs. This Remote Work Policy establishes the guidelines, eligibility criteria, and expectations for working outside of traditional office settings.</p>
    <p>This policy aims to:</p>
    <ul>
      <li>Enable flexibility in where and when work is performed</li>
      <li>Maintain high standards of productivity and service delivery</li>
      <li>Ensure effective communication and collaboration</li>
      <li>Protect company data and information security</li>
      <li>Comply with all applicable employment laws of Sierra Leone</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Types of Remote Work Arrangements</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item" style="border-left-color: #14b8a6;">
        <label>Fully Remote</label>
        <span>Work from home 5 days/week</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #14b8a6;">
        <label>Hybrid</label>
        <span>Combination of office and remote days</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #14b8a6;">
        <label>Occasional</label>
        <span>Ad-hoc remote work as needed</span>
      </div>
      <div class="sl-info-item" style="border-left-color: #14b8a6;">
        <label>Temporary</label>
        <span>Short-term arrangements (e.g., illness recovery)</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>3. Eligibility Criteria</h2>
    <p>To be eligible for remote work, employees must meet the following criteria:</p>
    
    <p><strong>3.1 Employment & Performance:</strong></p>
    <ul>
      <li>Completed probationary period (minimum {{probation_period}} months of service)</li>
      <li>Demonstrated consistent satisfactory performance</li>
      <li>No active disciplinary warnings on file (for regular remote work arrangements)</li>
      <li>Good attendance record</li>
    </ul>

    <p><strong>3.2 Job Suitability:</strong></p>
    <ul>
      <li>Role can be effectively performed remotely without significant impact on service delivery</li>
      <li>Job duties do not require constant physical presence in the office</li>
      <li>Work does not involve handling of physical materials or equipment that cannot be relocated</li>
      <li>Role does not require regular face-to-face interaction that cannot be substituted virtually</li>
    </ul>

    <p><strong>3.3 Employee Competencies:</strong></p>
    <ul>
      <li>Demonstrates strong self-management, time management, and organizational skills</li>
      <li>Ability to work independently with minimal supervision</li>
      <li>Excellent communication skills and responsiveness</li>
      <li>Proficient in using relevant technology and digital tools</li>
      <li>Proven track record of meeting deadlines and deliverables</li>
    </ul>

    <p><strong>3.4 Home Environment:</strong></p>
    <ul>
      <li>Has a dedicated, quiet workspace free from excessive distractions</li>
      <li>Reliable high-speed internet connection (minimum {{min_internet_speed}} Mbps)</li>
      <li>Adequate electrical power supply</li>
      <li>Safe and ergonomic work environment</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Application Process</h2>
    <p>Employees seeking remote work arrangements must:</p>
    <ol>
      <li>Discuss the request with their immediate supervisor</li>
      <li>Complete the Remote Work Application Form</li>
      <li>Obtain supervisor approval</li>
      <li>Submit to HR for final approval and documentation</li>
      <li>Sign this Remote Work Agreement</li>
      <li>Complete IT setup and security requirements</li>
    </ol>
    <p>Approval is not guaranteed and depends on business needs, role suitability, and individual circumstances. Requests may be approved on a trial basis initially.</p>
  </div>

  <div class="sl-section">
    <h2>5. Remote Work Arrangement</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%); border-color: #14b8a6;">
      <h3 style="color: #0d9488;">📋 Your Approved Arrangement</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #14b8a6;">
          <label>Arrangement Type</label>
          <span>{{remote_work_type}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #14b8a6;">
          <label>Remote Days per Week</label>
          <span>{{remote_days}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #14b8a6;">
          <label>Office Days (if hybrid)</label>
          <span>{{office_days}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #14b8a6;">
          <label>Core Hours</label>
          <span>{{core_hours}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #14b8a6;">
          <label>Effective Date</label>
          <span>{{effective_date}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #14b8a6;">
          <label>Review Period</label>
          <span>{{review_period}}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>6. Working Hours & Availability</h2>
    <ul>
      <li><strong>Core Hours:</strong> All remote employees must be available and responsive during core hours: {{core_hours}}</li>
      <li><strong>Work Schedule:</strong> Maintain the same total working hours as in-office employees ({{total_hours}} hours/week)</li>
      <li><strong>Flexibility:</strong> Some flexibility in start/end times is permitted with supervisor approval, provided core hours are covered</li>
      <li><strong>Overtime:</strong> Overtime requires prior approval and will be compensated as per company policy</li>
      <li><strong>Breaks:</strong> Take regular breaks including lunch break. Lunch break is unpaid</li>
      <li><strong>Communication:</strong> Keep your calendar updated and your status current on communication platforms</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Communication & Collaboration</h2>
    <p><strong>7.1 Communication Tools:</strong></p>
    <ul>
      <li>Use company-approved tools: {{approved_tools}}</li>
      <li>Respond to emails within {{response_time}} during work hours</li>
      <li>Respond to urgent messages or calls immediately</li>
      <li>Keep video on during virtual meetings to maintain engagement</li>
    </ul>

    <p><strong>7.2 Meetings & Check-ins:</strong></p>
    <ul>
      <li>Attend all scheduled team meetings (virtual or in-person as specified)</li>
      <li>Participate in {{checkin_frequency}} check-ins with your supervisor</li>
      <li>Join the morning stand-up/huddle if applicable to your team</li>
      <li>Give advance notice if you cannot attend a meeting</li>
    </ul>

    <p><strong>7.3 Responsiveness:</strong></p>
    <ul>
      <li>Be reachable by phone, email, and instant messaging during work hours</li>
      <li>Update your status if stepping away from desk</li>
      <li>Provide alternative contact if you will be unavailable</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Equipment, Technology & Support</h2>
    <p><strong>8.1 Company-Provided Equipment:</strong></p>
    <ul>
      <li>{{company_name}} will provide: {{equipment_provided}}</li>
      <li>Equipment remains company property and must be returned upon request or termination</li>
      <li>Use equipment only for work purposes</li>
      <li>Do not lend or allow others to use company equipment</li>
      <li>Report damage, loss, or theft immediately</li>
    </ul>

    <p><strong>8.2 Employee-Provided Resources:</strong></p>
    <ul>
      <li>Internet connection: Minimum {{min_internet_speed}} Mbps download speed</li>
      <li>Electricity and backup power as needed</li>
      <li>Workspace furniture (desk, chair)</li>
      <li>{{employee_provides}}</li>
    </ul>

    <p><strong>8.3 IT Support:</strong></p>
    <ul>
      <li>Technical support available during {{support_hours}}</li>
      <li>Contact IT support at {{it_contact}} for assistance</li>
      <li>Response time for remote support: {{support_response_time}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Information Security & Data Protection</h2>
    <div class="sl-highlight-box" style="background: #fef2f2; border-color: #dc2626;">
      <h3 style="color: #b91c1c;">🔒 Critical Security Requirements</h3>
      <p>All remote workers must strictly comply with the following security measures:</p>
    </div>

    <p><strong>9.1 Network Security:</strong></p>
    <ul>
      <li>Use only company-provided VPN to access company systems and data</li>
      <li>Never access company systems over public or unsecured Wi-Fi</li>
      <li>Ensure home Wi-Fi is secured with WPA2/WPA3 encryption and a strong password</li>
      <li>Change default router passwords immediately</li>
    </ul>

    <p><strong>9.2 Device Security:</strong></p>
    <ul>
      <li>Enable full-disk encryption on all devices</li>
      <li>Set strong passwords/PINs with auto-lock after {{device_lock_minutes}} minutes</li>
      <li>Install all security updates and patches promptly</li>
      <li>Enable multi-factor authentication (MFA) where available</li>
      <li>Never "jailbreak" or "root" company devices</li>
    </ul>

    <p><strong>9.3 Data Handling:</strong></p>
    <ul>
      <li>Store all work files on company-approved systems only (not personal devices)</li>
      <li>Use encrypted email when sending confidential information</li>
      <li>Do not print sensitive documents unless absolutely necessary; shred when disposing</li>
      <li>Lock computer screen when stepping away</li>
      <li>Do not allow family members or visitors to access company equipment or view company data</li>
    </ul>

    <p><strong>9.4 Physical Security:</strong></p>
    <ul>
      <li>Keep equipment in a secure location when not in use</li>
      <li>Do not leave devices visible in vehicles</li>
      <li>Ensure workspace is private when handling confidential information or on video calls</li>
      <li>Store devices securely overnight</li>
    </ul>

    <p><strong>9.5 Breach Reporting:</strong></p>
    <ul>
      <li>Report lost, stolen, or compromised devices immediately to {{it_contact}}</li>
      <li>Report security incidents (phishing, malware, unauthorized access) immediately</li>
      <li>Report any concerns about home network security</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Workspace Requirements & Health/Safety</h2>
    <ul>
      <li><strong>Dedicated Workspace:</strong> Maintain a dedicated area for work, free from excessive noise and distractions</li>
      <li><strong>Ergonomics:</strong> Set up an ergonomic workstation (proper desk height, chair support, screen position) to prevent strain and injury</li>
      <li><strong>Lighting:</strong> Adequate lighting to reduce eye strain</li>
      <li><strong>Electrical Safety:</strong> Ensure safe electrical connections without overloading</li>
      <li><strong>Regular Breaks:</strong> Take breaks every {{break_frequency}} to rest eyes and stretch</li>
      <li><strong>Work-Life Balance:</strong> Maintain clear boundaries between work and personal time</li>
      <li><strong>Injury Reporting:</strong> Report any work-related injuries or health issues immediately</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Performance & Productivity</h2>
    <p><strong>11.1 Performance Standards:</strong></p>
    <ul>
      <li>The same performance standards apply as for office-based employees</li>
      <li>Deliverables, deadlines, and quality expectations remain unchanged</li>
      <li>Regular performance reviews will be conducted as per company schedule</li>
    </ul>

    <p><strong>11.2 Reporting & Accountability:</strong></p>
    <ul>
      <li>Submit {{reporting_frequency}} progress reports as specified by your supervisor</li>
      <li>Track time and tasks using {{time_tracking_method}}</li>
      <li>Provide evidence of completed work when requested</li>
      <li>Maintain visibility of work status and availability</li>
    </ul>

    <p><strong>11.3 Meetings & Attendance:</strong></p>
    <ul>
      <li>Attend all scheduled meetings punctually (virtual or in-person)</li>
      <li>For hybrid workers, attend the office on designated days unless approved otherwise</li>
      <li>Give adequate notice if unable to attend meetings or need to reschedule</li>
      <li>May be required to attend the office for specific events, trainings, or meetings with {{in_person_notice}} notice</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>12. Equipment, Expenses & Allowances</h2>
    <div class="sl-highlight-box">
      <h3>💼 Equipment & Expense Policy</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item">
          <label>Company Provides</label>
          <span>{{equipment_provided}}</span>
        </div>
        <div class="sl-info-item">
          <label>Employee Provides</label>
          <span>{{employee_provides}}</span>
        </div>
        <div class="sl-info-item">
          <label>Internet Allowance</label>
          <span>{{internet_allowance}}</span>
        </div>
        <div class="sl-info-item">
          <label>Other Allowances</label>
          <span>{{other_allowances}}</span>
        </div>
      </div>
    </div>
    <p><strong>Equipment Care:</strong></p>
    <ul>
      <li>Maintain equipment in good condition</li>
      <li>Do not modify, disassemble, or repair equipment yourself</li>
      <li>Report technical issues promptly to IT support</li>
      <li>Return all equipment immediately upon termination of remote work or employment</li>
    </ul>

    <p><strong>Expense Policy:</strong></p>
    <p>{{expense_policy}}</p>
  </div>

  <div class="sl-section">
    <h2>13. Dependent Care & Personal Responsibilities</h2>
    <ul>
      <li>Remote work is not a substitute for childcare or dependent care</li>
      <li>Appropriate care arrangements for children or dependents must be in place during work hours</li>
      <li>Work activities should not be interrupted by personal or family matters</li>
      <li>Use annual leave or request time off for personal appointments</li>
      <li>Notify supervisor if personal circumstances affect your ability to work</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>14. Terms & Conditions</h2>
    <ul>
      <li><strong>Not a Right:</strong> Remote work is a privilege, not an entitlement, and may be withdrawn at any time</li>
      <li><strong>Same Terms Apply:</strong> All other employment terms (salary, benefits, leave, etc.) remain unchanged</li>
      <li><strong>Tax & Legal:</strong> Remote work does not change your tax residency or obligations</li>
      <li><strong>Working Hours:</strong> You are expected to work {{total_hours}} hours per week</li>
      <li><strong>Travel:</strong> If required to travel to the office or other locations, you will receive reasonable notice</li>
      <li><strong>Insurance:</strong> Notify your home insurance provider that you are working from home</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>15. Modification, Suspension & Termination</h2>
    <p>{{company_name}} reserves the right to modify, suspend, or terminate remote work arrangements:</p>
    <ul>
      <li><strong>Business Needs:</strong> If operational requirements necessitate office presence, with {{notice_period}} notice</li>
      <li><strong>Poor Performance:</strong> If work quality, productivity, or responsiveness declines</li>
      <li><strong>Policy Violations:</strong> If employee violates this policy, IT policy, or other company policies</li>
      <li><strong>Mutual Agreement:</strong> Either party may request termination of the arrangement</li>
      <li><strong>Emergencies:</strong> In cases of urgent business needs, immediate return to office may be required</li>
    </ul>
    <p>Termination of remote work does not constitute a change in employment terms or grounds for resignation, unless the employment contract explicitly provided for remote work.</p>
  </div>

  <div class="sl-section">
    <h2>16. Review & Monitoring</h2>
    <ul>
      <li>Remote work arrangements will be reviewed {{review_frequency}}</li>
      <li>Performance will be monitored regularly through {{monitoring_method}}</li>
      <li>Feedback sessions will be conducted to address concerns or challenges</li>
      <li>The company may adjust arrangements based on business needs or performance</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Agreement & Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, hereby acknowledge and agree that:</p>
    <ul>
      <li>I have read, understood, and agree to comply with this Remote Work Policy</li>
      <li>I meet the eligibility criteria and have the necessary resources for remote work</li>
      <li>I will maintain the same standards of performance and professionalism as in the office</li>
      <li>I understand and accept the communication, availability, and security requirements</li>
      <li>I will provide a safe, professional workspace conducive to productive work</li>
      <li>I understand that remote work is a privilege that may be modified or withdrawn</li>
      <li>I will comply with all company policies, including IT security and data protection policies</li>
      <li>I will return all company equipment immediately upon request or termination of employment</li>
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
    <p class="sl-legal-note">This agreement is subject to review and may be modified based on business needs. Questions? Contact HR.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Document Reference", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "probation_period", label: "Probation Period (Months)", type: "select", options: ["3", "6"], default: "3" },
      { key: "min_internet_speed", label: "Min Internet Speed (Mbps)", type: "select", options: ["5", "10", "20", "50"], default: "10" },
      { key: "remote_work_type", label: "Remote Work Type", type: "select", options: ["Fully Remote", "Hybrid (3 days remote)", "Hybrid (2 days remote)", "Occasional"], default: "Hybrid (2 days remote)" },
      { key: "remote_days", label: "Remote Days per Week", type: "select", options: ["1", "2", "3", "4", "5"], default: "2" },
      { key: "office_days", label: "Office Days (if hybrid)", type: "text", default: "Monday, Wednesday" },
      { key: "core_hours", label: "Core Hours", type: "text", default: "9:00 AM - 4:00 PM GMT" },
      { key: "total_hours", label: "Total Hours per Week", type: "number", default: "40" },
      { key: "effective_date", label: "Effective Date", type: "date", auto_fill: "today" },
      { key: "review_period", label: "Review Period", type: "select", options: ["3 months", "6 months", "12 months"], default: "6 months" },
      { key: "approved_tools", label: "Approved Communication Tools", type: "text", default: "Email, Microsoft Teams, Slack, Zoom" },
      { key: "response_time", label: "Email Response Time", type: "select", options: ["30 minutes", "1 hour", "2 hours", "4 hours"], default: "1 hour" },
      { key: "checkin_frequency", label: "Check-in Frequency", type: "select", options: ["daily", "weekly", "bi-weekly"], default: "weekly" },
      { key: "equipment_provided", label: "Equipment Provided", type: "text", default: "Laptop, headset, webcam, mouse" },
      { key: "employee_provides", label: "Employee Provides", type: "text", default: "Internet connection, workspace, furniture" },
      { key: "internet_allowance", label: "Internet Allowance", type: "select", options: ["None", "Partial reimbursement", "Full reimbursement up to SLE 200,000/month"], default: "None" },
      { key: "other_allowances", label: "Other Allowances", type: "text", default: "None" },
      { key: "expense_policy", label: "Detailed Expense Policy", type: "text", default: "Internet, electricity, and workspace costs are the employee's responsibility unless otherwise agreed in writing. Home office equipment (furniture) is not provided by the company." },
      { key: "support_hours", label: "IT Support Hours", type: "text", default: "Monday-Friday, 8:00 AM - 6:00 PM" },
      { key: "it_contact", label: "IT Contact", type: "text", default: "IT Support / Help Desk" },
      { key: "support_response_time", label: "IT Response Time", type: "select", options: ["1 hour", "4 hours", "24 hours"], default: "4 hours" },
      { key: "device_lock_minutes", label: "Device Auto-Lock (Minutes)", type: "select", options: ["5", "10", "15"], default: "5" },
      { key: "break_frequency", label: "Break Frequency", type: "text", default: "every 90 minutes" },
      { key: "reporting_frequency", label: "Progress Report Frequency", type: "select", options: ["daily", "weekly", "bi-weekly"], default: "weekly" },
      { key: "time_tracking_method", label: "Time Tracking Method", type: "text", default: "company time tracking system or honor system" },
      { key: "in_person_notice", label: "In-Person Meeting Notice", type: "select", options: ["24 hours", "48 hours", "1 week"], default: "48 hours" },
      { key: "monitoring_method", label: "Monitoring Method", type: "text", default: "regular check-ins, deliverable tracking, and performance reviews" },
      { key: "review_frequency", label: "Arrangement Review Frequency", type: "select", options: ["quarterly", "every 6 months", "annually"], default: "every 6 months" },
      { key: "notice_period", label: "Return to Office Notice", type: "select", options: ["1 week", "2 weeks", "1 month"], default: "2 weeks" },
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