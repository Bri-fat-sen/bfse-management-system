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
  </div>

  <div class="sl-section">
    <h2>Introduction</h2>
    <p>This Code of Conduct establishes the standards of behavior and ethical principles expected of all employees of <strong>{{company_name}}</strong>. These guidelines ensure a professional, respectful, and productive work environment for everyone.</p>
  </div>

  <div class="sl-section">
    <h2>1. Professional Standards</h2>
    <ul>
      <li>Perform all duties with diligence, integrity, and professionalism</li>
      <li>Treat all colleagues, clients, and stakeholders with respect and dignity</li>
      <li>Maintain punctuality and adhere to scheduled work hours</li>
      <li>Dress appropriately according to company dress code guidelines</li>
      <li>Communicate openly, honestly, and professionally with all team members</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. Workplace Behavior</h2>
    <ul>
      <li>Harassment, discrimination, or bullying of any kind is strictly prohibited</li>
      <li>Violence, threats, or intimidation will result in immediate disciplinary action</li>
      <li>Alcohol consumption and drug use during work hours is forbidden</li>
      <li>Gambling on company premises is prohibited</li>
      <li>Personal relationships must not interfere with professional duties</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Confidentiality & Data Protection</h2>
    <ul>
      <li>Protect all confidential company and client information at all times</li>
      <li>Never disclose sensitive business information to unauthorized persons</li>
      <li>Handle customer/client data in accordance with privacy policies</li>
      <li>Return all company materials upon termination of employment</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Use of Company Resources</h2>
    <ul>
      <li>Use company property and equipment responsibly for business purposes</li>
      <li>Report any equipment damage or malfunction immediately</li>
      <li>Personal use of company resources should be minimal and reasonable</li>
      <li>Never use company resources for illegal or unauthorized activities</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Conflict of Interest</h2>
    <ul>
      <li>Avoid situations where personal interests conflict with company interests</li>
      <li>Disclose any potential conflicts of interest to management promptly</li>
      <li>Do not accept gifts or favors that could influence business decisions</li>
      <li>Outside employment must not interfere with your duties at {{company_name}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Legal Compliance</h2>
    <ul>
      <li>Comply with all applicable laws of the Republic of Sierra Leone</li>
      <li>Follow the Employment Act 2023 and related labor regulations</li>
      <li>Report any illegal activities or policy violations to management</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Consequences of Violations</h2>
    <p>Violations of this Code of Conduct may result in disciplinary action, including:</p>
    <ul>
      <li>Verbal or written warning</li>
      <li>Suspension from duties</li>
      <li>Demotion or reduction in responsibilities</li>
      <li>Termination of employment</li>
    </ul>
    <p>The severity of action will depend on the nature of the violation, as outlined in the company's Disciplinary Policy and the Employment Act 2023.</p>
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
  <div class="sl-watermark">POLICY</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo">💻</div>
    <h1>IT Acceptable Use Policy</h1>
    <p class="sl-subtitle">{{company_name}} • Technology & Systems Usage Guidelines</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose</h2>
    <p>This policy defines the acceptable use of information technology resources at {{company_name}}. It applies to all employees, contractors, and third parties who access company IT systems, networks, and data.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope</h2>
    <p>This policy covers all IT resources including but not limited to:</p>
    <ul>
      <li>Computers, laptops, tablets, and mobile devices</li>
      <li>Company email and communication systems</li>
      <li>Internet access and network infrastructure</li>
      <li>Software applications and cloud services</li>
      <li>Data storage and backup systems</li>
      <li>Printers, scanners, and other peripherals</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Acceptable Use</h2>
    <p>IT resources should be used primarily for business purposes. Employees must:</p>
    <ul>
      <li>Use IT resources responsibly and professionally</li>
      <li>Protect login credentials and never share passwords</li>
      <li>Report security incidents or suspicious activities immediately</li>
      <li>Keep software and systems updated as required</li>
      <li>Follow data backup and protection procedures</li>
      <li>Respect intellectual property rights and software licenses</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. Prohibited Activities</h2>
    <p>The following activities are strictly prohibited:</p>
    <ul>
      <li>Accessing, downloading, or distributing illegal, offensive, or inappropriate content</li>
      <li>Installing unauthorized software or applications</li>
      <li>Attempting to bypass security controls or access restricted systems</li>
      <li>Using company resources for personal commercial activities</li>
      <li>Sending spam, chain letters, or malicious emails</li>
      <li>Copying or distributing copyrighted materials without authorization</li>
      <li>Connecting unauthorized devices to the company network</li>
      <li>Sharing confidential data through unsecured channels</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Email & Communication</h2>
    <ul>
      <li>Company email is for business communication</li>
      <li>Limited personal use is permitted but should not interfere with work</li>
      <li>Be professional in all electronic communications</li>
      <li>Do not open suspicious attachments or click unknown links</li>
      <li>All email communications may be monitored for security purposes</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Internet Usage</h2>
    <ul>
      <li>Internet access is provided for business purposes</li>
      <li>Reasonable personal use during breaks is permitted</li>
      <li>Access to inappropriate or illegal websites is prohibited</li>
      <li>Downloading large files should be done during off-peak hours</li>
      <li>Use of VPNs or proxy services to bypass filters is prohibited</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Security Requirements</h2>
    <div class="sl-highlight-box">
      <h3>🔒 Password Requirements</h3>
      <ul>
        <li>Minimum 8 characters with letters, numbers, and symbols</li>
        <li>Change passwords every 90 days</li>
        <li>Never share passwords or write them down</li>
        <li>Use different passwords for different systems</li>
        <li>Lock your computer when leaving your desk</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>8. Personal Devices (BYOD)</h2>
    <p>Personal devices used for work must:</p>
    <ul>
      <li>Have up-to-date security software installed</li>
      <li>Be password/PIN protected</li>
      <li>Have remote wipe capability enabled</li>
      <li>Be reported immediately if lost or stolen</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Monitoring</h2>
    <p>{{company_name}} reserves the right to monitor and audit all IT resources usage. This includes email, internet activity, and file access. Users should have no expectation of privacy when using company IT resources.</p>
  </div>

  <div class="sl-section">
    <h2>10. Consequences of Violation</h2>
    <p>Violations of this policy may result in:</p>
    <ul>
      <li>Revocation of IT access privileges</li>
      <li>Disciplinary action up to and including termination</li>
      <li>Legal action for serious violations</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, have read, understood, and agree to comply with this IT Acceptable Use Policy. I understand that violation of this policy may result in disciplinary action.</p>
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
    <p class="sl-legal-note">IT policy document - digitally signed and legally binding.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" }
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
    <p class="sl-subtitle">{{company_name}} • In Accordance with Employment Act 2023</p>
  </div>

  <div class="sl-section">
    <h2>1. Purpose</h2>
    <p>This policy establishes fair and consistent procedures for addressing employee conduct and performance issues. It ensures compliance with the Employment Act 2023 of Sierra Leone and protects the rights of both employers and employees.</p>
  </div>

  <div class="sl-section">
    <h2>2. Scope</h2>
    <p>This policy applies to all employees of {{company_name}} regardless of position, tenure, or employment type. It covers issues related to:</p>
    <ul>
      <li>Misconduct and behavioral issues</li>
      <li>Poor performance or failure to meet standards</li>
      <li>Violation of company policies</li>
      <li>Breach of employment contract</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Disciplinary Stages</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-color: #dc2626;">
      <h3 style="color: #dc2626;">Progressive Discipline Approach</h3>
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
    </div>
    <p><em>Note: Serious misconduct may result in immediate progression to later stages or summary dismissal.</em></p>
  </div>

  <div class="sl-section">
    <h2>4. Minor Misconduct Examples</h2>
    <ul>
      <li>Occasional lateness or unauthorized absence</li>
      <li>Minor breach of company procedures</li>
      <li>Unsatisfactory work quality or performance</li>
      <li>Failure to follow reasonable instructions</li>
      <li>Minor health and safety breaches</li>
      <li>Inappropriate dress or personal presentation</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Gross Misconduct (Section 91, Employment Act 2023)</h2>
    <p>The following offenses may result in summary dismissal without notice:</p>
    <ul>
      <li>Theft, fraud, or dishonesty</li>
      <li>Violence, physical assault, or threats</li>
      <li>Serious insubordination or refusal to follow lawful orders</li>
      <li>Being under the influence of alcohol or drugs at work</li>
      <li>Serious breach of health and safety rules</li>
      <li>Harassment, discrimination, or bullying</li>
      <li>Deliberate damage to company property</li>
      <li>Breach of confidentiality or data protection</li>
      <li>Criminal conduct affecting employment</li>
      <li>Falsification of records or documents</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. Investigation Process</h2>
    <ol>
      <li><strong>Report:</strong> Alleged misconduct is reported to HR/Management</li>
      <li><strong>Investigation:</strong> Impartial investigation is conducted</li>
      <li><strong>Suspension:</strong> Employee may be suspended on full pay during investigation</li>
      <li><strong>Evidence:</strong> All relevant evidence is gathered and documented</li>
      <li><strong>Interview:</strong> Employee is interviewed and given opportunity to respond</li>
    </ol>
  </div>

  <div class="sl-section">
    <h2>7. Disciplinary Hearing</h2>
    <p>Before any formal disciplinary action:</p>
    <ul>
      <li>Employee will receive written notice of allegations</li>
      <li>Employee may be accompanied by a colleague or union representative</li>
      <li>Employee will have opportunity to present their case</li>
      <li>Decision will be communicated in writing</li>
      <li>Right of appeal will be explained</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Right of Appeal</h2>
    <p>Employees have the right to appeal any disciplinary decision within <strong>5 working days</strong> of receiving the written outcome. Appeals should be submitted in writing to {{appeal_authority}}.</p>
  </div>

  <div class="sl-section">
    <h2>9. Record Keeping</h2>
    <p>All disciplinary records will be maintained in the employee's personnel file. Warnings will typically remain active for:</p>
    <ul>
      <li>Verbal Warning: 6 months</li>
      <li>First Written Warning: 12 months</li>
      <li>Final Written Warning: 18 months</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read and understood this Disciplinary Policy. I understand the standards of conduct expected and the consequences of failing to meet these standards.</p>
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
    <p class="sl-legal-note">This policy complies with the Employment Act 2023 of Sierra Leone.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "appeal_authority", label: "Appeal Authority", type: "text", default: "Managing Director or HR Director" }
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
    <p>This policy establishes guidelines for remote work arrangements at {{company_name}}. It ensures productivity, accountability, and work-life balance while maintaining company standards and data security.</p>
  </div>

  <div class="sl-section">
    <h2>2. Eligibility</h2>
    <p>Remote work may be available to employees who:</p>
    <ul>
      <li>Have completed their probationary period</li>
      <li>Have a role suitable for remote work</li>
      <li>Have demonstrated consistent performance</li>
      <li>Have a suitable home workspace</li>
      <li>Have reliable internet connectivity</li>
      <li>Have received manager approval</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. Types of Remote Work</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Full Remote</label>
        <span>Work entirely from home</span>
      </div>
      <div class="sl-info-item">
        <label>Hybrid</label>
        <span>Split between office and home</span>
      </div>
      <div class="sl-info-item">
        <label>Occasional</label>
        <span>As needed basis</span>
      </div>
      <div class="sl-info-item">
        <label>Temporary</label>
        <span>For specific period/project</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>4. Work Hours & Availability</h2>
    <ul>
      <li>Standard work hours remain {{work_hours}}</li>
      <li>Employees must be reachable during core hours ({{core_hours}})</li>
      <li>Respond to communications within reasonable time</li>
      <li>Attend all scheduled meetings (virtual or in-person)</li>
      <li>Update calendar with work schedule and availability</li>
      <li>Take regular breaks as per normal work policy</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. Workspace Requirements</h2>
    <div class="sl-highlight-box">
      <h3>🏡 Home Office Essentials</h3>
      <ul>
        <li>Dedicated, quiet workspace free from distractions</li>
        <li>Reliable internet connection (minimum 10 Mbps)</li>
        <li>Ergonomic seating and proper desk setup</li>
        <li>Adequate lighting for video calls</li>
        <li>Secure and private area for confidential work</li>
        <li>Backup power solution (generator/UPS) recommended</li>
      </ul>
    </div>
  </div>

  <div class="sl-section">
    <h2>6. Equipment & Technology</h2>
    <ul>
      <li>Company may provide necessary equipment (laptop, headset, etc.)</li>
      <li>Equipment remains company property and must be returned upon request</li>
      <li>Report any equipment issues or damage immediately</li>
      <li>Use only approved software and applications</li>
      <li>Keep all systems updated and secure</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. Data Security & Confidentiality</h2>
    <ul>
      <li>Use company VPN when accessing work systems</li>
      <li>Never use public Wi-Fi for work without VPN</li>
      <li>Lock computer when stepping away</li>
      <li>Keep confidential documents secure</li>
      <li>Do not allow family members to access work devices</li>
      <li>Shred or securely dispose of printed documents</li>
      <li>Report any security incidents immediately</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>8. Communication & Collaboration</h2>
    <ul>
      <li>Use company-approved communication tools</li>
      <li>Check emails and messages regularly</li>
      <li>Keep video on during team meetings when possible</li>
      <li>Maintain professional background for video calls</li>
      <li>Proactively communicate work progress and blockers</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>9. Performance & Accountability</h2>
    <ul>
      <li>Performance standards remain the same as in-office work</li>
      <li>Complete assigned tasks within agreed timelines</li>
      <li>Participate in regular check-ins with manager</li>
      <li>Track time and tasks as required</li>
      <li>Maintain productivity and quality standards</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>10. Health & Safety</h2>
    <ul>
      <li>Maintain an ergonomic workspace to prevent injury</li>
      <li>Take regular breaks from the screen</li>
      <li>Report any work-related injuries</li>
      <li>Maintain work-life boundaries</li>
      <li>Disconnect after work hours when possible</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>11. Expenses</h2>
    <p>{{expense_policy}}</p>
  </div>

  <div class="sl-section">
    <h2>12. Termination of Remote Work</h2>
    <p>Remote work arrangements may be terminated at any time by management if:</p>
    <ul>
      <li>Performance standards are not maintained</li>
      <li>Communication or availability issues arise</li>
      <li>Business needs require on-site presence</li>
      <li>Security or policy violations occur</li>
    </ul>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
    <p>I, <strong>{{employee_name}}</strong>, have read and understood this Remote Work Policy. I agree to comply with all requirements and understand that remote work is a privilege that may be modified or revoked.</p>
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
    <p class="sl-legal-note">This policy document is digitally signed and legally binding.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "work_hours", label: "Standard Work Hours", type: "text", default: "8:00 AM - 5:00 PM" },
      { key: "core_hours", label: "Core Hours", type: "text", default: "10:00 AM - 3:00 PM" },
      { key: "expense_policy", label: "Expense Policy", type: "text", default: "The company may contribute towards internet costs. Other expenses must be pre-approved by management." }
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
    <p>We are pleased to inform you that you have successfully completed your probationary period with {{company_name}}. This letter confirms your permanent employment with the organization.</p>
  </div>

  <div class="sl-section">
    <h2>Employment Confirmation Details</h2>
    <div class="sl-highlight-box" style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-color: #059669;">
      <h3 style="color: #059669;">🎉 Congratulations!</h3>
      <div class="sl-info-grid">
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Employee Name</label>
          <span>{{employee_name}}</span>
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
          <label>Confirmation Date</label>
          <span>{{confirmation_date}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Start Date</label>
          <span>{{start_date}}</span>
        </div>
        <div class="sl-info-item" style="border-left-color: #059669;">
          <label>Probation Period</label>
          <span>{{probation_months}} months</span>
        </div>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Performance Summary</h2>
    <p>During your probationary period, you have demonstrated:</p>
    <p>{{performance_summary}}</p>
    <p>Your dedication, hard work, and commitment to excellence have been recognized by your supervisors and colleagues.</p>
  </div>

  <div class="sl-section">
    <h2>Terms of Permanent Employment</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Employment Status</label>
        <span>Permanent</span>
      </div>
      <div class="sl-info-item">
        <label>Monthly Salary</label>
        <span>SLE {{confirmed_salary}}</span>
      </div>
    </div>
    <p>All other terms and conditions as stated in your original employment contract remain unchanged, unless otherwise specified.</p>
  </div>

  <div class="sl-section">
    <h2>Benefits Upon Confirmation</h2>
    <p>As a confirmed employee, you are now entitled to:</p>
    <ul>
      <li>Full annual leave entitlement (21 working days per Employment Act 2023)</li>
      <li>Company medical insurance coverage</li>
      <li>Performance bonus eligibility</li>
      <li>Training and development opportunities</li>
      <li>All other benefits as per company policy</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Notice Period</h2>
    <p>As a permanent employee, the notice period for termination by either party is now:</p>
    <ul>
      <li>Less than 3 years service: 1 month written notice</li>
      <li>3-5 years service: 2 months written notice</li>
      <li>Over 5 years service: 3 months written notice</li>
    </ul>
  </div>

  <div class="sl-section">
    <p>We value your contributions and look forward to your continued success and growth with {{company_name}}. Please continue to uphold the high standards you have demonstrated during your probation.</p>
    <p>Once again, congratulations on this achievement!</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>Employee Acknowledgment</h2>
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
    <p class="sl-legal-note">This document forms part of your employment record and is legally binding.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Reference Number", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "start_date", label: "Start Date", type: "date", auto_fill: "employee.hire_date" },
      { key: "confirmation_date", label: "Confirmation Date", type: "date", auto_fill: "today" },
      { key: "probation_months", label: "Probation Period (months)", type: "select", options: ["3", "6"], default: "3" },
      { key: "confirmed_salary", label: "Confirmed Salary (SLE)", type: "number", auto_fill: "employee.base_salary" },
      { key: "performance_summary", label: "Performance Summary", type: "text", default: "Excellent performance, meeting all expectations and demonstrating strong commitment to job responsibilities." },
      { key: "authorized_signatory", label: "Authorized Signatory", type: "text", default: "HR Manager" },
      { key: "signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" },
      { key: "issue_date", label: "Issue Date", type: "date", auto_fill: "today" }
    ]
  },

  termination_letter: {
    name: "Termination Letter",
    content: `
<div class="sl-document">
  <div class="sl-watermark">TERMINATION</div>
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <div class="sl-company-logo" style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);">📋</div>
    <h1>Notice of Termination of Employment</h1>
    <p class="sl-subtitle">{{company_name}} • Employment Termination Notice</p>
    <p class="sl-ref-number">Ref: TERM-{{document_ref}}</p>
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
        <label>Date of Notice</label>
        <span>{{notice_date}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <p>Dear <strong>{{employee_name}}</strong>,</p>
    <p>This letter serves as formal notice that your employment with {{company_name}} will be terminated effective <strong>{{termination_date}}</strong>.</p>
  </div>

  <div class="sl-section">
    <h2>Termination Details</h2>
    <div class="sl-info-grid">
      <div class="sl-info-item">
        <label>Reason for Termination</label>
        <span>{{termination_reason}}</span>
      </div>
      <div class="sl-info-item">
        <label>Last Working Day</label>
        <span>{{last_working_day}}</span>
      </div>
      <div class="sl-info-item">
        <label>Notice Period</label>
        <span>{{notice_period}}</span>
      </div>
      <div class="sl-info-item">
        <label>Termination Type</label>
        <span>{{termination_type}}</span>
      </div>
    </div>
  </div>

  <div class="sl-section">
    <h2>Reason for Termination</h2>
    <p>{{detailed_reason}}</p>
  </div>

  <div class="sl-section">
    <h2>Final Entitlements</h2>
    <p>In accordance with the Employment Act 2023 of Sierra Leone, you are entitled to receive:</p>
    <ul>
      <li><strong>Outstanding Salary:</strong> Payment for work performed up to and including your last working day</li>
      <li><strong>Accrued Leave:</strong> Payment for any unused annual leave entitlement</li>
      <li><strong>Notice Pay:</strong> {{notice_pay_details}}</li>
      <li><strong>Severance Pay:</strong> {{severance_details}}</li>
      <li><strong>NASSIT:</strong> Contributions up to termination date</li>
    </ul>
    <p>Your final payment will be processed within {{payment_timeline}} of your last working day.</p>
  </div>

  <div class="sl-section">
    <h2>Return of Company Property</h2>
    <p>You are required to return all company property before your last working day, including but not limited to:</p>
    <ul>
      <li>ID card and access cards/keys</li>
      <li>Laptop, phone, and other electronic devices</li>
      <li>Company documents and files</li>
      <li>Uniform and equipment</li>
      <li>Any other company-owned items</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Exit Requirements</h2>
    <ul>
      <li>Complete handover of duties and responsibilities</li>
      <li>Attend exit interview with HR (if required)</li>
      <li>Return all company property</li>
      <li>Settle any outstanding advances or loans</li>
      <li>Update contact information for final documentation</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>Confidentiality Obligations</h2>
    <p>Please be reminded that your confidentiality obligations as outlined in your employment contract and any Non-Disclosure Agreement continue after your employment ends. You must not disclose any confidential information about {{company_name}}.</p>
  </div>

  <div class="sl-section">
    <h2>Reference</h2>
    <p>{{reference_statement}}</p>
  </div>

  <div class="sl-section">
    <h2>Right of Appeal</h2>
    <p>If you believe this termination is unjust, you have the right to appeal within 14 days per the Employment Act 2023. Appeals should be submitted in writing to {{appeal_authority}}.</p>
  </div>

  <div class="sl-section">
    <p>We thank you for your service to {{company_name}} and wish you well in your future endeavors.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <h4>For the Company</h4>
      <p><strong>{{authorized_signatory}}</strong></p>
      <p>{{signatory_title}}</p>
      <p>Date: {{notice_date}}</p>
      <div class="sl-signature-line"></div>
    </div>
    <div class="sl-signature-block">
      <h4>Employee Acknowledgment</h4>
      <p><strong>{{employee_name}}</strong></p>
      <p>Date Received: _______________</p>
      <div class="sl-signature-line"></div>
      <p style="font-size: 10px; color: #888; margin-top: 5px;">Employee Signature (acknowledging receipt)</p>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <div class="sl-footer-logo">🇸🇱</div>
    <p><strong>{{company_name}}</strong></p>
    <p>Republic of Sierra Leone</p>
    <p class="sl-legal-note">This notice is issued in accordance with the Employment Act 2023 of Sierra Leone. A copy will be retained in the employee's personnel file.</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "document_ref", label: "Reference Number", type: "text", auto_fill: "auto" },
      { key: "employee_name", label: "Employee Name", type: "text", auto_fill: "employee.full_name" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "notice_date", label: "Notice Date", type: "date", auto_fill: "today" },
      { key: "termination_date", label: "Termination Date", type: "date" },
      { key: "last_working_day", label: "Last Working Day", type: "date" },
      { key: "notice_period", label: "Notice Period", type: "select", options: ["7 days", "1 month", "2 months", "3 months", "Immediate"], default: "1 month" },
      { key: "termination_type", label: "Termination Type", type: "select", options: ["Resignation", "Redundancy", "End of Contract", "Dismissal", "Mutual Agreement", "Retirement"], default: "End of Contract" },
      { key: "termination_reason", label: "Reason Category", type: "select", options: ["Voluntary Resignation", "Redundancy/Restructuring", "Contract Expiry", "Performance Issues", "Misconduct", "Mutual Agreement", "Retirement", "Other"], default: "Contract Expiry" },
      { key: "detailed_reason", label: "Detailed Reason", type: "text", default: "As discussed in our meeting, your employment is being terminated as per the terms stated above." },
      { key: "notice_pay_details", label: "Notice Pay Details", type: "text", default: "As per contract terms" },
      { key: "severance_details", label: "Severance Details", type: "text", default: "As per Employment Act 2023 and company policy" },
      { key: "payment_timeline", label: "Payment Timeline", type: "text", default: "14 days" },
      { key: "reference_statement", label: "Reference Statement", type: "text", default: "A reference letter will be provided upon request for future employment purposes." },
      { key: "appeal_authority", label: "Appeal Authority", type: "text", default: "Managing Director" },
      { key: "authorized_signatory", label: "Authorized Signatory", type: "text", default: "HR Manager" },
      { key: "signatory_title", label: "Signatory Title", type: "text", default: "Human Resources" }
    ],
    requires_signature: false
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