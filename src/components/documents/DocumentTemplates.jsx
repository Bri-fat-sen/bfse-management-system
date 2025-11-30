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
    <p>In accordance with the Employment Act 2023 of Sierra Leone, you shall be entitled to the following leave benefits:</p>
    <ul>
      <li><strong>Annual Leave:</strong> 21 working days with full pay after completing 12 months of continuous service. Leave shall accrue at the rate of 1.75 days per month and must be utilized within the leave year unless carry-forward is approved by management (maximum 10 days)</li>
      <li><strong>Sick Leave:</strong> 5 days paid sick leave per calendar year. Absences exceeding 2 consecutive days require a medical certificate from a registered medical practitioner. Extended illness beyond 5 days may be considered for unpaid leave or medical board review</li>
      <li><strong>Maternity Leave:</strong> Female employees are entitled to 14 weeks (98 days) of maternity leave per Section 47 of the Employment Act, with at least 6 weeks taken after delivery. The first 6 weeks shall be at full pay, with subsequent weeks at 50% pay or as per company policy if more favorable</li>
      <li><strong>Paternity Leave:</strong> Male employees are entitled to 5 working days of paternity leave to be taken within 2 weeks of the birth of their child, upon presentation of birth certificate</li>
      <li><strong>Compassionate Leave:</strong> 5 working days for death of immediate family members (spouse, children, parents, siblings) and 3 days for extended family members</li>
      <li><strong>Public Holidays:</strong> All gazetted public holidays in Sierra Leone shall be observed as paid leave. Work performed on public holidays shall be compensated at 2.5 times the normal rate</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Working Conditions</h2>
    <ul>
      <li><strong>Hours of Work:</strong> The standard working week shall be {{working_hours}} hours, typically Monday to Friday. Any work beyond standard hours shall be considered overtime and compensated accordingly</li>
      <li><strong>Overtime:</strong> Overtime work must be pre-approved by your supervisor. Overtime shall be compensated at 1.5 times the normal hourly rate for weekdays and 2 times for weekends</li>
      <li><strong>Rest Periods:</strong> You are entitled to a minimum 1-hour lunch break and a weekly rest period of at least 24 consecutive hours</li>
      <li><strong>Health & Safety:</strong> The Employer shall provide a safe working environment in compliance with the Factories Act and relevant health and safety regulations. The Employee shall comply with all safety procedures and report any hazards</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Statutory Contributions & Deductions</h2>
    <p>The following statutory deductions shall be made from your salary:</p>
    <ul>
      <li><strong>NASSIT (Employee):</strong> 5% of gross salary contributed to the National Social Security and Insurance Trust for your pension and social security benefits</li>
      <li><strong>NASSIT (Employer):</strong> The Company shall contribute an additional 10% of your gross salary to NASSIT on your behalf</li>
      <li><strong>PAYE Tax:</strong> Pay As You Earn income tax shall be deducted according to the National Revenue Authority (NRA) tax brackets applicable at the time</li>
    </ul>
    <p>You will receive a payslip each month detailing all earnings and deductions.</p>
  </div>

  <div class="sl-section">
    <h2>7. Termination Provisions</h2>
    <p>This employment may be terminated by either party subject to the following notice periods as prescribed by Section 85 of the Employment Act 2023:</p>
    <ul>
      <li><strong>During Probation:</strong> 7 days written notice by either party, or payment in lieu of notice</li>
      <li><strong>Less than 3 years service:</strong> 1 month written notice or payment in lieu</li>
      <li><strong>3 to 5 years service:</strong> 2 months written notice or payment in lieu</li>
      <li><strong>Over 5 years service:</strong> 3 months written notice or payment in lieu</li>
    </ul>
    <p><strong>Summary Dismissal:</strong> The Employer reserves the right to terminate employment immediately without notice for gross misconduct as defined in Section 91 of the Employment Act 2023, including but not limited to theft, fraud, violence, serious insubordination, or being under the influence of alcohol or drugs at work.</p>
    <p><strong>Redundancy:</strong> In the event of redundancy, you shall be entitled to severance pay calculated as one month's basic salary for each completed year of service, in addition to any outstanding leave pay and other entitlements.</p>
    <p><strong>Final Settlement:</strong> Upon termination for any reason, you shall receive all outstanding wages, accrued leave pay, and any other entitlements within 14 days of your last working day.</p>
  </div>

  <div class="sl-section">
    <h2>8. Confidentiality & Intellectual Property</h2>
    <p>The Employee acknowledges and agrees that:</p>
    <ul>
      <li>All confidential information, trade secrets, customer data, business strategies, and proprietary information of the Company shall remain strictly confidential during and after employment</li>
      <li>Any inventions, discoveries, designs, or improvements made during the course of employment and relating to the Company's business shall be the exclusive property of the Company</li>
      <li>Upon termination, all company property, documents, files, and materials (physical or electronic) must be returned immediately</li>
      <li>Breach of confidentiality may result in disciplinary action and/or legal proceedings</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Code of Conduct & Disciplinary Procedures</h2>
    <p>The Employee shall:</p>
    <ul>
      <li>Comply with all company policies, procedures, and rules as communicated from time to time</li>
      <li>Perform duties diligently, honestly, and to the best of their ability</li>
      <li>Maintain professional conduct and treat colleagues, customers, and stakeholders with respect</li>
      <li>Not engage in any activity that conflicts with the interests of the Company</li>
      <li>Report any concerns, grievances, or violations through the appropriate channels</li>
    </ul>
    <p>The Company's disciplinary procedures comply with natural justice principles and the Employment Act 2023. Disciplinary action shall follow a progressive approach (verbal warning, written warning, final warning, dismissal) except in cases of gross misconduct.</p>
  </div>

  <div class="sl-section">
    <h2>10. Dispute Resolution</h2>
    <p>Any disputes arising from this contract shall be resolved through the following process:</p>
    <ol>
      <li><strong>Internal Resolution:</strong> First, attempt to resolve the matter through the Company's internal grievance procedure</li>
      <li><strong>Mediation:</strong> If unresolved, the matter may be referred to the Ministry of Labour for mediation</li>
      <li><strong>Labour Court:</strong> Disputes that cannot be resolved through mediation may be referred to the Labour Court of Sierra Leone</li>
    </ol>
  </div>

  <div class="sl-section">
    <h2>11. General Provisions</h2>
    <ul>
      <li><strong>Entire Agreement:</strong> This contract constitutes the entire agreement between the parties and supersedes all prior negotiations, representations, and agreements</li>
      <li><strong>Amendments:</strong> Any amendments to this contract must be made in writing and signed by both parties</li>
      <li><strong>Severability:</strong> If any provision of this contract is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect</li>
      <li><strong>Governing Law:</strong> This contract shall be governed by and construed in accordance with the laws of the Republic of Sierra Leone, including the Employment Act 2023</li>
    </ul>
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
  </div>

  <div class="sl-section">
    <h2>Introduction</h2>
    <p>This Code of Conduct establishes the standards of behavior, ethical principles, and professional expectations for all employees of <strong>{{company_name}}</strong>. Our commitment to excellence depends on each team member upholding these standards, which are designed to foster a respectful, inclusive, safe, and productive work environment where everyone can thrive.</p>
    <p>This Code applies to all employees, contractors, interns, and representatives of the Company during work hours and at any company-related activities, events, or functions. Violations may result in disciplinary action up to and including termination of employment.</p>
  </div>

  <div class="sl-section">
    <h2>1. Professional Standards & Integrity</h2>
    <p>All employees are expected to:</p>
    <ul>
      <li><strong>Excellence:</strong> Perform all duties with diligence, competence, and commitment to quality. Continuously seek to improve your skills and knowledge</li>
      <li><strong>Integrity:</strong> Act honestly and ethically in all business dealings. Never misrepresent facts, falsify records, or engage in deceptive practices</li>
      <li><strong>Respect:</strong> Treat all colleagues, clients, suppliers, and stakeholders with dignity, courtesy, and professionalism regardless of their position, background, or beliefs</li>
      <li><strong>Punctuality:</strong> Arrive on time for work and meetings. Notify your supervisor promptly if you will be late or absent</li>
      <li><strong>Professionalism:</strong> Maintain a professional demeanor in all interactions. Use appropriate language and conduct yourself in a manner that reflects positively on the Company</li>
      <li><strong>Dress Code:</strong> Adhere to the company dress code appropriate for your role. Maintain good personal hygiene and present yourself professionally</li>
      <li><strong>Communication:</strong> Communicate clearly, respectfully, and professionally in all forms—verbal, written, and electronic. Respond to inquiries in a timely manner</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Workplace Behavior & Conduct</h2>
    <p>To maintain a safe, harmonious, and productive workplace, the following behaviors are expected and/or prohibited:</p>
    <ul>
      <li><strong>Zero Tolerance for Harassment:</strong> Any form of harassment—sexual, verbal, physical, or psychological—is strictly prohibited and will result in immediate disciplinary action. This includes unwelcome advances, offensive jokes, intimidation, bullying, and discrimination</li>
      <li><strong>Non-Discrimination:</strong> {{company_name}} is committed to equal opportunity. Discrimination based on race, gender, religion, ethnicity, disability, age, political opinion, sexual orientation, or any other protected characteristic is prohibited per the Employment Act 2023</li>
      <li><strong>Violence & Threats:</strong> Physical violence, threats, intimidation, or any behavior that creates fear or an unsafe environment is grounds for immediate termination and may result in legal action</li>
      <li><strong>Substance Abuse:</strong> Being under the influence of alcohol or illegal drugs during work hours or on company premises is strictly prohibited. Employees must not consume alcohol during work hours except at authorized company events</li>
      <li><strong>Gambling:</strong> Gambling of any form on company premises or during work hours is prohibited</li>
      <li><strong>Personal Relationships:</strong> While personal relationships are not prohibited, they must not interfere with work performance, create conflicts of interest, or result in favoritism. Romantic relationships between supervisors and direct reports must be disclosed to HR</li>
      <li><strong>Respectful Disagreement:</strong> Differences of opinion should be expressed professionally and constructively. Personal attacks or disrespectful behavior during disagreements is not acceptable</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Confidentiality & Data Protection</h2>
    <p>Protecting company and client information is essential to our business integrity:</p>
    <ul>
      <li><strong>Confidential Information:</strong> All business information including financial data, customer lists, pricing strategies, business plans, technical data, and employee information must be treated as strictly confidential unless specifically authorized for disclosure</li>
      <li><strong>Data Security:</strong> Follow all data protection policies. Use strong passwords, lock computers when away, and never share login credentials. Report any data breaches or suspected security incidents immediately</li>
      <li><strong>Client/Customer Data:</strong> Handle all client and customer data with the utmost care and in accordance with privacy regulations. Never access, share, or use personal data beyond what is necessary for your job duties</li>
      <li><strong>Social Media:</strong> Do not share confidential company information on social media. When representing the Company online, maintain professionalism and avoid controversial statements</li>
      <li><strong>Post-Employment:</strong> Confidentiality obligations continue after employment ends. All company materials, documents, and data must be returned upon termination</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Use of Company Resources</h2>
    <p>Company resources are provided to enable you to perform your job effectively:</p>
    <ul>
      <li><strong>Responsible Use:</strong> Use company property—including computers, phones, vehicles, equipment, and supplies—responsibly and primarily for business purposes</li>
      <li><strong>Personal Use:</strong> Limited personal use of company resources (e.g., occasional personal emails or calls) is permitted provided it does not interfere with work, incur significant costs, or violate any policies</li>
      <li><strong>Care & Maintenance:</strong> Take proper care of company equipment. Report any damage, malfunction, or loss immediately to your supervisor or IT department</li>
      <li><strong>Prohibited Uses:</strong> Never use company resources for illegal activities, personal commercial ventures, accessing inappropriate content, or any activity that could harm the Company's reputation or operations</li>
      <li><strong>Software & Licenses:</strong> Only use authorized software and respect intellectual property rights. Do not install unauthorized programs or copy licensed software</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Conflict of Interest</h2>
    <p>Employees must avoid situations where personal interests could conflict with the Company's interests:</p>
    <ul>
      <li><strong>Definition:</strong> A conflict of interest occurs when personal relationships, financial interests, or outside activities could influence or appear to influence your professional judgment or actions</li>
      <li><strong>Disclosure:</strong> Immediately disclose any actual or potential conflicts of interest to your supervisor or HR department. When in doubt, ask</li>
      <li><strong>Gifts & Entertainment:</strong> Do not accept gifts, hospitality, or favors that could influence business decisions or create an obligation. Modest gifts of nominal value (under SLE 500,000) may be accepted if refusing would cause offense, but must be reported</li>
      <li><strong>Outside Employment:</strong> Secondary employment or business activities must not interfere with your job performance, conflict with Company interests, or compete with Company business. Obtain written approval before engaging in outside employment</li>
      <li><strong>Family & Relationships:</strong> Disclose any business dealings involving family members or close personal relationships. Avoid involvement in hiring, supervision, or business decisions affecting relatives</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Legal & Regulatory Compliance</h2>
    <p>All employees must comply with applicable laws and regulations:</p>
    <ul>
      <li><strong>Sierra Leone Laws:</strong> Comply with all laws of the Republic of Sierra Leone including employment law, tax law, health and safety regulations, and anti-corruption laws</li>
      <li><strong>Employment Act 2023:</strong> Understand and follow the requirements of the Employment Act 2023 and related labor regulations</li>
      <li><strong>Anti-Bribery & Corruption:</strong> Never offer, give, solicit, or accept bribes or improper payments. This includes payments to government officials, customers, suppliers, or any other parties</li>
      <li><strong>Reporting Violations:</strong> Report any known or suspected violations of law, regulation, or company policy to management or HR. Whistleblowers are protected from retaliation</li>
      <li><strong>Cooperation:</strong> Cooperate fully with any internal or external investigations</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Health, Safety & Environment</h2>
    <ul>
      <li>Follow all health and safety rules, procedures, and instructions</li>
      <li>Report unsafe conditions, accidents, or near-misses immediately</li>
      <li>Use personal protective equipment (PPE) as required</li>
      <li>Keep your work area clean, organized, and safe</li>
      <li>Support environmental sustainability initiatives</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Reporting Concerns & Grievances</h2>
    <p>{{company_name}} encourages open communication and provides channels for reporting concerns:</p>
    <ul>
      <li>Speak directly with your supervisor or manager</li>
      <li>Contact the Human Resources department</li>
      <li>Use the company's grievance procedure for formal complaints</li>
      <li>All reports will be treated confidentially and investigated promptly</li>
      <li>Retaliation against anyone who reports concerns in good faith is strictly prohibited</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Consequences of Violations</h2>
    <p>Violations of this Code of Conduct will be taken seriously and may result in disciplinary action proportionate to the severity of the violation:</p>
    <ul>
      <li><strong>Verbal Warning:</strong> For minor first-time offenses, with counseling and guidance</li>
      <li><strong>Written Warning:</strong> For repeated minor offenses or more serious violations</li>
      <li><strong>Final Warning:</strong> For continued violations or serious misconduct, with clear consequences stated</li>
      <li><strong>Suspension:</strong> Temporary removal from duties, with or without pay, pending investigation or as a disciplinary measure</li>
      <li><strong>Demotion:</strong> Reduction in position, responsibilities, or compensation</li>
      <li><strong>Termination:</strong> Dismissal from employment for serious or repeated violations</li>
      <li><strong>Legal Action:</strong> For violations involving criminal conduct, fraud, or significant harm</li>
    </ul>
    <p>All disciplinary actions will follow the company's Disciplinary Policy and comply with the Employment Act 2023 of Sierra Leone, ensuring fair process and the right to appeal.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read, understood, and agree to comply with this Code of Conduct. I understand that violation of these standards may result in disciplinary action up to and including termination of my employment.</p>
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
    <p class="sl-legal-note">This policy document was digitally signed and is legally binding.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "company_initial", label: "Company Initial", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" }
    ]
  },

  privacy_policy: {
    name: "Employee Privacy Policy Acknowledgment",
    content: `
<div class="sl-document">
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>EMPLOYEE DATA PRIVACY POLICY</h1>
    <p class="sl-subtitle">{{company_name}}</p>
  </div>

  <div class="sl-section">
    <h2>1. PURPOSE</h2>
    <p>This policy explains how {{company_name}} collects, uses, stores, and protects your personal information in accordance with Sierra Leone's data protection principles and best practices.</p>
  </div>

  <div class="sl-section">
    <h2>2. DATA WE COLLECT</h2>
    <p>We collect and process the following personal information:</p>
    <ul>
      <li><strong>Personal Details:</strong> Name, date of birth, gender, nationality, national ID/passport number</li>
      <li><strong>Contact Information:</strong> Address, phone number, email, emergency contacts</li>
      <li><strong>Employment Information:</strong> Job title, department, work history, qualifications, performance records</li>
      <li><strong>Financial Information:</strong> Bank details, salary, tax information, NASSIT details</li>
      <li><strong>Health Information:</strong> Medical records relevant to employment, sick leave records</li>
      <li><strong>Biometric Data:</strong> Fingerprints or facial recognition for attendance (where applicable)</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. HOW WE USE YOUR DATA</h2>
    <ul>
      <li>To administer your employment relationship</li>
      <li>To process payroll and statutory contributions (NASSIT, PAYE)</li>
      <li>To manage attendance, leave, and performance</li>
      <li>To comply with legal and regulatory requirements</li>
      <li>To provide employee benefits and services</li>
      <li>To communicate with you about work-related matters</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. DATA SHARING</h2>
    <p>Your personal data may be shared with:</p>
    <ul>
      <li>National Social Security and Insurance Trust (NASSIT)</li>
      <li>National Revenue Authority (NRA) for tax purposes</li>
      <li>Banks for salary payment processing</li>
      <li>Insurance providers for employee benefits</li>
      <li>Government authorities when required by law</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. DATA SECURITY</h2>
    <p>We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. This includes:</p>
    <ul>
      <li>Secure electronic storage with access controls</li>
      <li>Physical security for paper records</li>
      <li>Staff training on data protection</li>
      <li>Regular security reviews</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. YOUR RIGHTS</h2>
    <p>You have the right to:</p>
    <ul>
      <li>Access your personal data held by the company</li>
      <li>Request correction of inaccurate data</li>
      <li>Request information about how your data is used</li>
      <li>Raise concerns about data handling</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. DATA RETENTION</h2>
    <p>We retain your personal data for the duration of your employment and for a period of 7 years after termination to comply with legal and regulatory requirements.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>ACKNOWLEDGMENT</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read and understood this Privacy Policy. I consent to the collection, use, and processing of my personal data as described in this policy.</p>
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

  health_safety_policy: {
    name: "Health & Safety Policy",
    content: `
<div class="sl-document">
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>HEALTH AND SAFETY POLICY</h1>
    <p class="sl-subtitle">{{company_name}}</p>
  </div>

  <div class="sl-section">
    <h2>1. POLICY STATEMENT</h2>
    <p>{{company_name}} is committed to providing a safe and healthy working environment for all employees, contractors, and visitors in accordance with the Factories Act and Employment Act 2023 of Sierra Leone.</p>
  </div>

  <div class="sl-section">
    <h2>2. EMPLOYER RESPONSIBILITIES</h2>
    <ul>
      <li>Provide a safe workplace free from recognized hazards</li>
      <li>Ensure adequate training on health and safety procedures</li>
      <li>Provide necessary personal protective equipment (PPE)</li>
      <li>Maintain equipment and facilities in safe condition</li>
      <li>Conduct regular safety inspections and risk assessments</li>
      <li>Investigate all accidents and near-misses</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. EMPLOYEE RESPONSIBILITIES</h2>
    <ul>
      <li>Follow all safety rules, regulations, and procedures</li>
      <li>Use required PPE correctly and consistently</li>
      <li>Report all accidents, injuries, and unsafe conditions immediately</li>
      <li>Participate in safety training programs</li>
      <li>Do not operate equipment without proper training</li>
      <li>Keep work areas clean and organized</li>
      <li>Do not engage in horseplay or reckless behavior</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. EMERGENCY PROCEDURES</h2>
    <ul>
      <li>Know the location of emergency exits, fire extinguishers, and first aid kits</li>
      <li>Follow evacuation procedures during emergencies</li>
      <li>Report to designated assembly points during evacuations</li>
      <li>Contact emergency services: Police - 019, Fire - 020, Ambulance - 022</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. FIRST AID</h2>
    <p>First aid kits are located at {{first_aid_locations}}. Trained first aiders are available during working hours.</p>
  </div>

  <div class="sl-section">
    <h2>6. ACCIDENT REPORTING</h2>
    <p>All accidents, however minor, must be reported to your supervisor immediately and recorded in the accident book. Serious accidents will be reported to the relevant authorities as required by law.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>ACKNOWLEDGMENT</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read, understood, and agree to comply with this Health and Safety Policy. I understand my responsibilities for maintaining a safe workplace.</p>
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
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "first_aid_locations", label: "First Aid Locations", type: "text", default: "Reception, Kitchen, and each floor" }
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
    <p>For purposes of this Agreement, "Confidential Information" means any and all non-public information, in any form or medium, that is disclosed to, accessed by, or comes to the knowledge of the Employee through their employment, including but not limited to:</p>
    <ul>
      <li><strong>Business Information:</strong> Business plans, strategies, objectives, market research, competitive analysis, expansion plans, mergers and acquisitions information, and organizational restructuring plans</li>
      <li><strong>Financial Information:</strong> Revenue figures, profit margins, pricing structures, cost data, budgets, financial projections, investment strategies, and unpublished financial statements</li>
      <li><strong>Customer & Supplier Data:</strong> Customer lists, contact information, purchase history, preferences, contracts, supplier agreements, pricing negotiations, and relationship details</li>
      <li><strong>Technical Information:</strong> Product designs, formulas, specifications, manufacturing processes, research and development data, prototypes, inventions, patents (pending or granted), and trade secrets</li>
      <li><strong>Technology & Software:</strong> Source code, algorithms, software architecture, system designs, databases, security protocols, and IT infrastructure details</li>
      <li><strong>Marketing & Sales:</strong> Marketing strategies, advertising campaigns, sales forecasts, customer acquisition strategies, and promotional materials in development</li>
      <li><strong>Human Resources:</strong> Employee information, compensation data, performance reviews, disciplinary records, and organizational charts</li>
      <li><strong>Legal Matters:</strong> Pending or threatened litigation, legal strategies, regulatory filings, and compliance matters</li>
      <li><strong>Any Marked Information:</strong> Any information designated as "Confidential," "Proprietary," "Secret," or with similar marking</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Employee Obligations</h2>
    <p>The Employee hereby agrees to the following obligations, which shall survive the termination of employment:</p>
    <ul>
      <li><strong>Non-Disclosure:</strong> Maintain strict confidentiality of all Confidential Information. Never disclose, publish, or communicate Confidential Information to any unauthorized person, entity, or organization, whether during or after employment</li>
      <li><strong>Limited Use:</strong> Use Confidential Information solely and exclusively for the purpose of performing authorized job duties for the benefit of the Company. Never use Confidential Information for personal gain or to benefit any third party</li>
      <li><strong>Security Measures:</strong> Take all reasonable and necessary precautions to protect Confidential Information from unauthorized access, disclosure, copying, or use. This includes securing documents, using password protection, and following company security protocols</li>
      <li><strong>No Copying:</strong> Not copy, reproduce, or duplicate Confidential Information except as necessary for authorized work purposes. All copies remain the property of the Company</li>
      <li><strong>Return of Materials:</strong> Upon termination of employment, or upon request by the Company, immediately return all documents, files, records, devices, and materials (in any format) containing or relating to Confidential Information. This includes electronic files, which must be permanently deleted from personal devices</li>
      <li><strong>Notification of Breach:</strong> Immediately notify the Company's management or legal department of any actual or suspected unauthorized disclosure, theft, or breach of Confidential Information</li>
      <li><strong>Cooperation:</strong> Cooperate fully with the Company in any investigation of security breaches or unauthorized disclosures</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Exclusions from Confidential Information</h2>
    <p>The obligations under this Agreement shall not apply to information that the Employee can demonstrate:</p>
    <ul>
      <li><strong>Public Knowledge:</strong> Is or becomes generally available to the public through no wrongful act, omission, or breach of this Agreement by the Employee</li>
      <li><strong>Prior Knowledge:</strong> Was lawfully in the Employee's possession prior to disclosure by the Company, as evidenced by written records</li>
      <li><strong>Third Party Disclosure:</strong> Is received from a third party who is not under a confidentiality obligation to the Company and who has the right to disclose it</li>
      <li><strong>Independent Development:</strong> Is independently developed by the Employee without reference to or use of any Confidential Information</li>
      <li><strong>Legal Requirement:</strong> Is required to be disclosed by law, regulation, court order, or governmental authority, provided that the Employee gives the Company prompt written notice to enable the Company to seek a protective order</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Non-Solicitation</h2>
    <p>During employment and for a period of {{duration_years}} year(s) after termination, the Employee agrees not to:</p>
    <ul>
      <li>Directly or indirectly solicit, recruit, or hire any employee of the Company</li>
      <li>Encourage any employee to leave their employment with the Company</li>
      <li>Solicit business from any customer or client of the Company with whom the Employee had contact during employment</li>
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