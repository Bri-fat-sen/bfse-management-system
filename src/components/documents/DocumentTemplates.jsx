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
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>EMPLOYMENT CONTRACT</h1>
    <p class="sl-subtitle">In accordance with the Employment Act 2023 of Sierra Leone</p>
  </div>

  <div class="sl-section">
    <h2>PARTIES TO THIS AGREEMENT</h2>
    <p><strong>EMPLOYER:</strong> {{company_name}}</p>
    <p>Address: {{company_address}}</p>
    <p>Registration No: {{company_registration}}</p>
    <br/>
    <p><strong>EMPLOYEE:</strong> {{employee_name}}</p>
    <p>Address: {{employee_address}}</p>
    <p>National ID/Passport: {{employee_id_number}}</p>
  </div>

  <div class="sl-section">
    <h2>1. COMMENCEMENT AND DURATION</h2>
    <p>1.1 This contract shall commence on <strong>{{start_date}}</strong>.</p>
    <p>1.2 The Employee shall serve a probationary period of <strong>{{probation_period}}</strong> months, as permitted under Section 21 of the Employment Act 2023 (maximum 6 months).</p>
    <p>1.3 This is a <strong>{{contract_type}}</strong> contract.</p>
  </div>

  <div class="sl-section">
    <h2>2. POSITION AND DUTIES</h2>
    <p>2.1 The Employee is employed in the position of <strong>{{position}}</strong> in the <strong>{{department}}</strong> department.</p>
    <p>2.2 The Employee shall report to <strong>{{reports_to}}</strong>.</p>
    <p>2.3 The Employee's primary duties shall include:</p>
    <p>{{job_duties}}</p>
    <p>2.4 The Employee's principal place of work shall be <strong>{{work_location}}</strong>.</p>
  </div>

  <div class="sl-section">
    <h2>3. REMUNERATION</h2>
    <p>3.1 The Employee shall receive a gross monthly salary of <strong>SLE {{monthly_salary}}</strong>.</p>
    <p>3.2 Payment shall be made on or before the <strong>{{pay_day}}</strong> of each month by {{payment_method}}.</p>
    <p>3.3 The following allowances shall apply:</p>
    <ul>
      {{allowances_list}}
    </ul>
    <p>3.4 Statutory deductions (NASSIT 5%, PAYE as applicable) shall be deducted as required by law.</p>
  </div>

  <div class="sl-section">
    <h2>4. WORKING HOURS</h2>
    <p>4.1 Normal working hours shall be <strong>{{working_hours}}</strong> per week, as per Section 41 of the Employment Act 2023.</p>
    <p>4.2 The standard work schedule is {{work_schedule}}.</p>
    <p>4.3 Overtime work shall be compensated at 1.5x the regular hourly rate, or 2x for weekends and public holidays.</p>
  </div>

  <div class="sl-section">
    <h2>5. LEAVE ENTITLEMENTS</h2>
    <p>Per the Employment Act 2023:</p>
    <ul>
      <li><strong>Annual Leave:</strong> 21 working days after 12 months of continuous service</li>
      <li><strong>Sick Leave:</strong> 5 days paid sick leave per year with medical certificate</li>
      <li><strong>Maternity Leave:</strong> 14 weeks (applicable to female employees)</li>
      <li><strong>Paternity Leave:</strong> 5 days (applicable to male employees)</li>
      <li><strong>Compassionate Leave:</strong> 5 days for immediate family bereavement</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. TERMINATION</h2>
    <p>6.1 Either party may terminate this contract by giving notice as follows:</p>
    <ul>
      <li>During probation: 7 days written notice</li>
      <li>Less than 3 years service: 1 month notice</li>
      <li>3-5 years service: 2 months notice</li>
      <li>Over 5 years service: 3 months notice</li>
    </ul>
    <p>6.2 Summary dismissal may occur for gross misconduct as defined in Section 91 of the Employment Act 2023.</p>
    <p>6.3 Upon termination, the Employee shall be entitled to all outstanding remuneration and benefits accrued.</p>
  </div>

  <div class="sl-section">
    <h2>7. CONFIDENTIALITY</h2>
    <p>The Employee agrees to maintain confidentiality of all proprietary information during and after employment.</p>
  </div>

  <div class="sl-section">
    <h2>8. GOVERNING LAW</h2>
    <p>This contract shall be governed by the laws of Sierra Leone, including the Employment Act 2023, and any disputes shall be subject to the jurisdiction of Sierra Leone courts.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <p><strong>FOR THE EMPLOYER:</strong></p>
      <p>Name: {{employer_signatory}}</p>
      <p>Title: {{employer_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line">____________________________</div>
    </div>
    <div class="sl-signature-block">
      <p><strong>EMPLOYEE:</strong></p>
      <p>Name: {{employee_name}}</p>
      <p>Date: <span class="sl-signature-date">{{signature_date}}</span></p>
      <div class="sl-digital-signature">{{digital_signature}}</div>
    </div>
  </div>

  <div class="sl-footer">
    <div class="sl-flag-bar"></div>
    <p>This document was generated and digitally signed using {{company_name}}'s HR Management System</p>
    <p>🇸🇱 Republic of Sierra Leone</p>
  </div>
</div>
    `,
    variables: [
      { key: "company_name", label: "Company Name", type: "text", auto_fill: "organisation.name" },
      { key: "company_address", label: "Company Address", type: "text", auto_fill: "organisation.address" },
      { key: "company_registration", label: "Registration Number", type: "text", auto_fill: "organisation.business_registration_number" },
      { key: "employee_name", label: "Employee Full Name", type: "text", auto_fill: "employee.full_name" },
      { key: "employee_address", label: "Employee Address", type: "text", auto_fill: "employee.address" },
      { key: "employee_id_number", label: "Employee ID/Passport", type: "text" },
      { key: "start_date", label: "Start Date", type: "date", auto_fill: "employee.hire_date" },
      { key: "probation_period", label: "Probation Period (months)", type: "select", options: ["3", "6"], default: "3" },
      { key: "contract_type", label: "Contract Type", type: "select", options: ["Permanent", "Fixed-Term", "Temporary"], default: "Permanent" },
      { key: "position", label: "Position", type: "text", auto_fill: "employee.position" },
      { key: "department", label: "Department", type: "text", auto_fill: "employee.department" },
      { key: "reports_to", label: "Reports To", type: "text" },
      { key: "job_duties", label: "Job Duties", type: "text" },
      { key: "work_location", label: "Work Location", type: "text", auto_fill: "employee.assigned_location_name" },
      { key: "monthly_salary", label: "Monthly Salary (SLE)", type: "number", auto_fill: "employee.base_salary" },
      { key: "pay_day", label: "Pay Day", type: "select", options: ["25th", "Last working day", "1st of following month"], default: "25th" },
      { key: "payment_method", label: "Payment Method", type: "select", options: ["Bank Transfer", "Mobile Money", "Cheque", "Cash"], default: "Bank Transfer" },
      { key: "allowances_list", label: "Allowances", type: "text", default: "<li>Transport Allowance</li><li>Medical Allowance</li>" },
      { key: "working_hours", label: "Weekly Working Hours", type: "number", default: "40" },
      { key: "work_schedule", label: "Work Schedule", type: "text", default: "Monday to Friday, 8:00 AM to 5:00 PM" },
      { key: "employer_signatory", label: "Employer Signatory Name", type: "text" },
      { key: "employer_title", label: "Employer Signatory Title", type: "text" },
      { key: "issue_date", label: "Issue Date", type: "date" }
    ]
  },

  code_of_conduct: {
    name: "Employee Code of Conduct",
    content: `
<div class="sl-document">
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>EMPLOYEE CODE OF CONDUCT</h1>
    <p class="sl-subtitle">{{company_name}}</p>
  </div>

  <div class="sl-section">
    <h2>INTRODUCTION</h2>
    <p>This Code of Conduct outlines the standards of behavior expected of all employees of {{company_name}}. By signing this document, you agree to uphold these standards throughout your employment.</p>
  </div>

  <div class="sl-section">
    <h2>1. PROFESSIONAL CONDUCT</h2>
    <ul>
      <li>Perform duties with diligence, integrity, and professionalism</li>
      <li>Treat all colleagues, clients, and stakeholders with respect and dignity</li>
      <li>Maintain punctuality and adhere to work schedules</li>
      <li>Dress appropriately according to company dress code</li>
      <li>Communicate openly and honestly with supervisors and team members</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. WORKPLACE BEHAVIOR</h2>
    <ul>
      <li>Harassment, discrimination, or bullying of any kind is strictly prohibited</li>
      <li>Violence, threats, or intimidation will result in immediate disciplinary action</li>
      <li>Alcohol consumption and drug use during work hours is forbidden</li>
      <li>Gambling on company premises is prohibited</li>
      <li>Personal relationships must not interfere with professional duties</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. CONFIDENTIALITY</h2>
    <ul>
      <li>Protect company confidential information at all times</li>
      <li>Do not disclose sensitive business information to unauthorized persons</li>
      <li>Handle customer/client data in accordance with privacy policies</li>
      <li>Return all company materials upon termination of employment</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. USE OF COMPANY RESOURCES</h2>
    <ul>
      <li>Use company property and equipment responsibly and for business purposes</li>
      <li>Report any damage or malfunction immediately</li>
      <li>Personal use of company resources should be minimal and reasonable</li>
      <li>Do not use company resources for illegal activities</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. CONFLICT OF INTEREST</h2>
    <ul>
      <li>Avoid situations where personal interests conflict with company interests</li>
      <li>Disclose any potential conflicts to management</li>
      <li>Do not accept gifts or favors that could influence business decisions</li>
      <li>Outside employment must not interfere with your role at {{company_name}}</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. COMPLIANCE WITH LAWS</h2>
    <ul>
      <li>Comply with all applicable laws of Sierra Leone</li>
      <li>Follow the Employment Act 2023 and related labor regulations</li>
      <li>Report any illegal activities or violations to management</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>7. DISCIPLINARY ACTION</h2>
    <p>Violations of this Code of Conduct may result in disciplinary action, including:</p>
    <ul>
      <li>Verbal or written warning</li>
      <li>Suspension</li>
      <li>Demotion</li>
      <li>Termination of employment</li>
    </ul>
    <p>The severity of action will depend on the nature of the violation, as outlined in the company's Disciplinary Policy and the Code of Practice on Discipline in the Employment Act 2023.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>ACKNOWLEDGMENT</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read, understood, and agree to comply with this Code of Conduct. I understand that violation of these standards may result in disciplinary action up to and including termination of my employment.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <p><strong>EMPLOYEE:</strong></p>
      <p>Name: {{employee_name}}</p>
      <p>Position: {{position}}</p>
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
      { key: "first_aid_locations", label: "First Aid Kit Locations", type: "text", default: "Reception, Kitchen, and each floor" }
    ]
  },

  nda: {
    name: "Non-Disclosure Agreement",
    content: `
<div class="sl-document">
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>NON-DISCLOSURE AGREEMENT</h1>
    <p class="sl-subtitle">Confidentiality Agreement</p>
  </div>

  <div class="sl-section">
    <h2>PARTIES</h2>
    <p><strong>DISCLOSING PARTY:</strong> {{company_name}} ("Company")</p>
    <p><strong>RECEIVING PARTY:</strong> {{employee_name}} ("Employee")</p>
    <p><strong>EFFECTIVE DATE:</strong> {{effective_date}}</p>
  </div>

  <div class="sl-section">
    <h2>1. CONFIDENTIAL INFORMATION</h2>
    <p>For purposes of this Agreement, "Confidential Information" includes all information or data disclosed to or known by the Employee relating to:</p>
    <ul>
      <li>Business strategies, plans, and operations</li>
      <li>Financial information and projections</li>
      <li>Customer and supplier lists and data</li>
      <li>Product designs, formulas, and specifications</li>
      <li>Trade secrets and proprietary processes</li>
      <li>Marketing and pricing strategies</li>
      <li>Software and technical data</li>
      <li>Employee and personnel information</li>
      <li>Any other information marked as confidential</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. OBLIGATIONS</h2>
    <p>The Employee agrees to:</p>
    <ul>
      <li>Keep all Confidential Information strictly confidential</li>
      <li>Not disclose Confidential Information to any third party without written consent</li>
      <li>Use Confidential Information only for performing job duties</li>
      <li>Take reasonable measures to protect confidentiality</li>
      <li>Return all materials containing Confidential Information upon termination</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. EXCLUSIONS</h2>
    <p>This Agreement does not apply to information that:</p>
    <ul>
      <li>Is publicly available through no fault of the Employee</li>
      <li>Was known to the Employee prior to disclosure</li>
      <li>Is independently developed by the Employee</li>
      <li>Is required to be disclosed by law or court order</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. DURATION</h2>
    <p>This Agreement shall remain in effect during employment and for a period of <strong>{{duration_years}}</strong> years after termination of employment.</p>
  </div>

  <div class="sl-section">
    <h2>5. REMEDIES</h2>
    <p>The Employee acknowledges that breach of this Agreement may cause irreparable harm to the Company. The Company shall be entitled to seek injunctive relief and damages for any breach.</p>
  </div>

  <div class="sl-section">
    <h2>6. GOVERNING LAW</h2>
    <p>This Agreement shall be governed by the laws of Sierra Leone.</p>
  </div>

  <div class="sl-signatures">
    <div class="sl-signature-block">
      <p><strong>FOR THE COMPANY:</strong></p>
      <p>Name: {{company_signatory}}</p>
      <p>Title: {{company_signatory_title}}</p>
      <p>Date: {{issue_date}}</p>
      <div class="sl-signature-line">____________________________</div>
    </div>
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
      { key: "effective_date", label: "Effective Date", type: "date" },
      { key: "duration_years", label: "Duration (years after termination)", type: "select", options: ["1", "2", "3", "5"], default: "2" },
      { key: "company_signatory", label: "Company Signatory", type: "text" },
      { key: "company_signatory_title", label: "Signatory Title", type: "text" },
      { key: "issue_date", label: "Issue Date", type: "date" }
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
  <div class="sl-header">
    <div class="sl-flag-bar"></div>
    <h1>LEAVE POLICY</h1>
    <p class="sl-subtitle">{{company_name}} • Per Employment Act 2023</p>
  </div>

  <div class="sl-section">
    <h2>1. ANNUAL LEAVE</h2>
    <p>Per Section 44 of the Employment Act 2023:</p>
    <ul>
      <li>Employees are entitled to <strong>21 working days</strong> of paid annual leave after 12 months of continuous service</li>
      <li>Leave accrues at 1.75 days per month of service</li>
      <li>Leave must be taken within 12 months of accrual unless otherwise agreed</li>
      <li>Unused leave may be carried forward with management approval (maximum 10 days)</li>
      <li>Leave requests should be submitted at least 2 weeks in advance</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>2. SICK LEAVE</h2>
    <ul>
      <li><strong>5 days</strong> paid sick leave per year</li>
      <li>Medical certificate required for absences of 2 or more consecutive days</li>
      <li>Extended sick leave may be granted at management discretion</li>
      <li>Notify supervisor as early as possible on the first day of illness</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>3. MATERNITY LEAVE</h2>
    <p>Per Section 47 of the Employment Act 2023:</p>
    <ul>
      <li>Female employees are entitled to <strong>14 weeks</strong> (98 days) of maternity leave</li>
      <li>At least 6 weeks must be taken after delivery</li>
      <li>Full pay for the first 6 weeks; subsequent weeks at 50% pay</li>
      <li>Medical certificate confirming pregnancy required</li>
      <li>Job protection during maternity leave</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>4. PATERNITY LEAVE</h2>
    <ul>
      <li>Male employees are entitled to <strong>5 working days</strong> of paid paternity leave</li>
      <li>Must be taken within 2 weeks of child's birth</li>
      <li>Birth certificate required</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>5. COMPASSIONATE LEAVE</h2>
    <ul>
      <li><strong>5 working days</strong> for death of immediate family member (spouse, child, parent, sibling)</li>
      <li><strong>3 working days</strong> for extended family members</li>
      <li>Additional unpaid leave may be requested</li>
    </ul>
  </div>

  <div class="sl-section">
    <h2>6. PUBLIC HOLIDAYS</h2>
    <p>All employees are entitled to paid leave on Sierra Leone public holidays. If required to work on a public holiday, compensation shall be at 2.5x the regular rate.</p>
  </div>

  <div class="sl-section">
    <h2>7. UNPAID LEAVE</h2>
    <p>Unpaid leave may be granted at management discretion for personal reasons. Requests must be submitted in writing with at least 2 weeks notice.</p>
  </div>

  <div class="sl-acknowledgment">
    <h2>ACKNOWLEDGMENT</h2>
    <p>I, <strong>{{employee_name}}</strong>, acknowledge that I have read and understood this Leave Policy. I agree to follow the procedures outlined for requesting and taking leave.</p>
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
  }
};

// CSS Styles for Sierra Leone themed documents
export const SL_DOCUMENT_STYLES = `
  .sl-document {
    font-family: 'Georgia', serif;
    max-width: 800px;
    margin: 0 auto;
    padding: 40px;
    background: white;
    color: #1a1a1a;
    line-height: 1.6;
  }
  
  .sl-header {
    text-align: center;
    margin-bottom: 40px;
    padding-bottom: 20px;
    border-bottom: 2px solid #0F1F3C;
  }
  
  .sl-flag-bar {
    height: 8px;
    background: linear-gradient(to right, #1EB053 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #0072C6 66.66%);
    margin-bottom: 20px;
    border-radius: 4px;
  }
  
  .sl-header h1 {
    color: #0F1F3C;
    font-size: 28px;
    margin: 0 0 10px 0;
    text-transform: uppercase;
    letter-spacing: 2px;
  }
  
  .sl-subtitle {
    color: #666;
    font-style: italic;
    margin: 0;
  }
  
  .sl-section {
    margin-bottom: 30px;
  }
  
  .sl-section h2 {
    color: #0072C6;
    font-size: 18px;
    border-bottom: 1px solid #ddd;
    padding-bottom: 8px;
    margin-bottom: 15px;
  }
  
  .sl-section p, .sl-section li {
    margin-bottom: 10px;
  }
  
  .sl-section ul, .sl-section ol {
    padding-left: 25px;
  }
  
  .sl-acknowledgment {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin: 30px 0;
    border-left: 4px solid #1EB053;
  }
  
  .sl-signatures {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 40px;
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #ddd;
  }
  
  .sl-signature-block {
    flex: 1;
    min-width: 250px;
  }
  
  .sl-signature-line {
    margin-top: 30px;
    border-bottom: 1px solid #333;
    padding-bottom: 5px;
  }
  
  .sl-digital-signature {
    margin-top: 15px;
    padding: 15px;
    background: linear-gradient(135deg, #f0f9f4 0%, #e6f3ff 100%);
    border: 2px solid #1EB053;
    border-radius: 8px;
    text-align: center;
    font-family: 'Brush Script MT', cursive;
    font-size: 24px;
    color: #0F1F3C;
  }
  
  .sl-signature-date {
    font-weight: bold;
  }
  
  .sl-footer {
    margin-top: 40px;
    padding-top: 20px;
    text-align: center;
    color: #666;
    font-size: 12px;
  }
  
  .sl-footer .sl-flag-bar {
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  @media print {
    .sl-document {
      padding: 20px;
    }
    
    .sl-section {
      page-break-inside: avoid;
    }
  }
`;