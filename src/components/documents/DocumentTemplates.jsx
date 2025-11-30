// Sierra Leone Employment Document Templates
// Per Employment Act 2023 and local regulations

export const DOCUMENT_TYPES = [
  { value: "employment_contract", label: "Employment Contract", icon: "FileText", requiresSignature: true },
  { value: "nda", label: "Non-Disclosure Agreement", icon: "ShieldCheck", requiresSignature: true },
  { value: "code_of_conduct", label: "Code of Conduct", icon: "BookOpen", requiresSignature: true },
  { value: "privacy_policy", label: "Privacy Policy", icon: "Lock", requiresSignature: true },
  { value: "health_safety_policy", label: "Health & Safety Policy", icon: "Heart", requiresSignature: true },
  { value: "anti_harassment_policy", label: "Anti-Harassment Policy", icon: "Shield", requiresSignature: true },
  { value: "data_protection_policy", label: "Data Protection Policy", icon: "Database", requiresSignature: true },
  { value: "disciplinary_policy", label: "Disciplinary Policy", icon: "AlertTriangle", requiresSignature: true },
  { value: "grievance_policy", label: "Grievance Policy", icon: "MessageSquare", requiresSignature: true },
  { value: "leave_policy", label: "Leave Policy", icon: "Calendar", requiresSignature: true },
  { value: "remote_work_policy", label: "Remote Work Policy", icon: "Home", requiresSignature: true },
  { value: "it_acceptable_use", label: "IT Acceptable Use Policy", icon: "Monitor", requiresSignature: true },
  { value: "confidentiality_agreement", label: "Confidentiality Agreement", icon: "Eye", requiresSignature: true },
  { value: "probation_confirmation", label: "Probation Confirmation", icon: "CheckCircle", requiresSignature: false },
  { value: "promotion_letter", label: "Promotion Letter", icon: "TrendingUp", requiresSignature: false },
  { value: "warning_letter", label: "Warning Letter", icon: "AlertCircle", requiresSignature: true },
  { value: "termination_letter", label: "Termination Letter", icon: "XCircle", requiresSignature: false },
  { value: "resignation_acceptance", label: "Resignation Acceptance", icon: "LogOut", requiresSignature: false },
  { value: "salary_revision", label: "Salary Revision Letter", icon: "DollarSign", requiresSignature: false },
  { value: "bonus_letter", label: "Bonus Letter", icon: "Gift", requiresSignature: false },
  { value: "other", label: "Other Document", icon: "File", requiresSignature: false }
];

export const DEFAULT_TEMPLATES = {
  employment_contract: {
    name: "Standard Employment Contract",
    content: `
# EMPLOYMENT CONTRACT

## REPUBLIC OF SIERRA LEONE

---

**CONTRACT OF EMPLOYMENT**

This Contract of Employment ("Contract") is made and entered into on **{{effective_date}}** in accordance with the Employment Act, 2023 of Sierra Leone.

---

## PARTIES

**EMPLOYER:**
- **Company Name:** {{company_name}}
- **Address:** {{company_address}}
- **Registration Number:** {{company_registration}}
- **NASSIT Number:** {{company_nassit}}

**EMPLOYEE:**
- **Full Name:** {{employee_name}}
- **Address:** {{employee_address}}
- **National ID Number:** {{employee_national_id}}
- **NASSIT Number:** {{employee_nassit}}

---

## 1. POSITION AND DUTIES

1.1 The Employee is hereby employed in the position of **{{position}}** in the **{{department}}** department.

1.2 The Employee shall report to **{{supervisor_name}}** or such other person as may be designated by the Employer.

1.3 The Employee's duties shall include but not be limited to:
{{job_duties}}

1.4 The Employee agrees to perform such duties faithfully and to the best of their ability.

---

## 2. COMMENCEMENT AND DURATION

2.1 This employment shall commence on **{{start_date}}**.

2.2 This Contract is for **{{contract_type}}** employment.

2.3 The probationary period shall be **{{probation_months}}** months, in accordance with Section 26 of the Employment Act, 2023.

---

## 3. PLACE OF WORK

3.1 The Employee's primary place of work shall be at **{{work_location}}**.

3.2 The Employee may be required to work at other locations as reasonably required by the Employer.

---

## 4. HOURS OF WORK

4.1 Normal working hours shall be from **{{work_start_time}}** to **{{work_end_time}}**, Monday to Friday.

4.2 The Employee may be required to work overtime, which shall be compensated at:
- 1.5x regular rate for weekday overtime
- 2.0x regular rate for weekend work
- 2.5x regular rate for public holiday work

4.3 Night work (8:00 PM to 6:00 AM) shall attract a differential of 1.25x the regular rate, per Section 42 of the Employment Act, 2023.

---

## 5. REMUNERATION

5.1 The Employee shall receive a gross monthly salary of **SLE {{monthly_salary}}** ({{salary_in_words}}).

5.2 Payment shall be made on or before the **{{payment_day}}** of each month by {{payment_method}}.

5.3 The following allowances shall apply:
{{allowances_list}}

5.4 Statutory deductions shall include:
- NASSIT Employee Contribution (5% of gross pay)
- PAYE Tax (as per current Finance Act)

---

## 6. LEAVE ENTITLEMENTS

In accordance with the Employment Act, 2023:

6.1 **Annual Leave:** {{annual_leave_days}} working days per year after one year of continuous service.

6.2 **Sick Leave:** {{sick_leave_days}} days paid sick leave per year with medical certificate.

6.3 **Maternity Leave:** 14 weeks with full pay for female employees.

6.4 **Paternity Leave:** 5 working days for male employees.

6.5 **Compassionate Leave:** 5 working days in case of bereavement.

---

## 7. TERMINATION

7.1 During probation: Either party may terminate with 7 days written notice.

7.2 After probation:
- Less than 3 years service: 30 days notice
- 3-5 years service: 60 days notice  
- More than 5 years service: 90 days notice

7.3 Summary dismissal may occur for gross misconduct as defined in the Code of Practice on Discipline (Schedule to Employment Act, 2023).

7.4 Upon termination, the Employee shall be entitled to:
- Payment in lieu of accrued annual leave
- Severance pay as prescribed by law
- Certificate of service

---

## 8. CONFIDENTIALITY

8.1 The Employee shall not, during or after employment, disclose any confidential information relating to the Employer's business, clients, or operations.

8.2 All documents, data, and materials shall remain the property of the Employer.

---

## 9. GOVERNING LAW

9.1 This Contract shall be governed by and construed in accordance with the laws of the Republic of Sierra Leone.

9.2 Any dispute shall be resolved through the procedures set out in the Employment Act, 2023.

---

## 10. ACKNOWLEDGMENT

By signing below, both parties acknowledge that they have read, understood, and agree to be bound by the terms and conditions set forth in this Contract.

---

**FOR THE EMPLOYER:**

Signature: _________________________

Name: {{issuer_name}}

Position: {{issuer_position}}

Date: {{issue_date}}

---

**FOR THE EMPLOYEE:**

Signature: _________________________

Name: {{employee_name}}

Date: _______________

---

*This contract is issued in duplicate. Each party shall retain one copy.*

🇸🇱 **Republic of Sierra Leone** | Employment Act, 2023 Compliant
`,
    placeholders: [
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "company_address", label: "Company Address", type: "text", required: true },
      { key: "company_registration", label: "Business Registration No.", type: "text", required: false },
      { key: "company_nassit", label: "Company NASSIT No.", type: "text", required: false },
      { key: "employee_name", label: "Employee Full Name", type: "text", required: true },
      { key: "employee_address", label: "Employee Address", type: "text", required: false },
      { key: "employee_national_id", label: "National ID Number", type: "text", required: false },
      { key: "employee_nassit", label: "Employee NASSIT No.", type: "text", required: false },
      { key: "position", label: "Job Position", type: "text", required: true },
      { key: "department", label: "Department", type: "text", required: true },
      { key: "supervisor_name", label: "Supervisor Name", type: "text", required: false },
      { key: "job_duties", label: "Job Duties", type: "text", required: false },
      { key: "start_date", label: "Start Date", type: "date", required: true },
      { key: "contract_type", label: "Contract Type (Permanent/Fixed-term)", type: "text", required: true },
      { key: "probation_months", label: "Probation Period (months)", type: "number", required: true },
      { key: "work_location", label: "Work Location", type: "text", required: true },
      { key: "work_start_time", label: "Work Start Time", type: "text", required: true },
      { key: "work_end_time", label: "Work End Time", type: "text", required: true },
      { key: "monthly_salary", label: "Monthly Salary (SLE)", type: "currency", required: true },
      { key: "salary_in_words", label: "Salary in Words", type: "text", required: true },
      { key: "payment_day", label: "Payment Day", type: "text", required: true },
      { key: "payment_method", label: "Payment Method", type: "text", required: true },
      { key: "allowances_list", label: "Allowances List", type: "text", required: false },
      { key: "annual_leave_days", label: "Annual Leave Days", type: "number", required: true },
      { key: "sick_leave_days", label: "Sick Leave Days", type: "number", required: true },
      { key: "issuer_name", label: "Issuer Name", type: "text", required: true },
      { key: "issuer_position", label: "Issuer Position", type: "text", required: true },
      { key: "issue_date", label: "Issue Date", type: "date", required: true }
    ]
  },

  code_of_conduct: {
    name: "Employee Code of Conduct",
    content: `
# EMPLOYEE CODE OF CONDUCT

## {{company_name}}

### Republic of Sierra Leone

---

**Effective Date:** {{effective_date}}

**Version:** {{version}}

---

## INTRODUCTION

This Code of Conduct ("Code") establishes the standards of professional behaviour expected of all employees of {{company_name}} ("the Company"). This Code is issued in accordance with the Employment Act, 2023 of Sierra Leone and the Code of Practice on Discipline contained therein.

---

## 1. GENERAL PRINCIPLES

All employees shall:

1.1 Act with honesty, integrity, and professionalism at all times.

1.2 Treat colleagues, customers, and stakeholders with respect and dignity.

1.3 Comply with all applicable laws of the Republic of Sierra Leone.

1.4 Protect the Company's reputation and assets.

1.5 Report any violations of this Code promptly.

---

## 2. PROFESSIONAL CONDUCT

### 2.1 Attendance and Punctuality
- Report to work on time as per your employment contract
- Notify your supervisor promptly of any absence
- Obtain proper authorization for leave

### 2.2 Dress Code
- Maintain a professional and appropriate appearance
- Wear company uniform where provided
- Observe safety equipment requirements

### 2.3 Work Performance
- Perform duties to the best of your ability
- Meet deadlines and quality standards
- Seek continuous improvement in your work

---

## 3. WORKPLACE RELATIONSHIPS

### 3.1 Respect and Dignity
- Treat all persons with respect regardless of:
  - Race, tribe, or ethnicity
  - Gender or sex
  - Religion or belief
  - Political opinion
  - Disability
  - Age
  - Social origin

### 3.2 Prohibited Conduct
The following are strictly prohibited:
- Harassment of any kind (sexual, verbal, physical)
- Bullying or intimidation
- Discrimination
- Violence or threats of violence
- Use of abusive language

---

## 4. CONFIDENTIALITY AND DATA PROTECTION

4.1 Employees shall maintain confidentiality of:
- Company trade secrets and proprietary information
- Customer and client data
- Employee personal information
- Financial and business records

4.2 Data shall only be accessed, used, or disclosed for legitimate business purposes.

4.3 Confidentiality obligations continue after employment ends.

---

## 5. CONFLICTS OF INTEREST

5.1 Employees must avoid situations where personal interests conflict with Company interests.

5.2 The following must be disclosed:
- Outside employment or business interests
- Financial interests in competitors or suppliers
- Personal relationships that may influence decisions

5.3 Prior written approval is required for secondary employment.

---

## 6. USE OF COMPANY RESOURCES

6.1 Company property and equipment shall be used for business purposes only.

6.2 Employees are responsible for safeguarding Company assets.

6.3 Personal use of Company resources requires authorization.

6.4 IT systems must be used in accordance with the IT Acceptable Use Policy.

---

## 7. HEALTH AND SAFETY

7.1 Employees shall comply with all health and safety regulations.

7.2 Report all accidents, injuries, or hazards immediately.

7.3 The following are prohibited in the workplace:
- Possession or use of illegal drugs
- Reporting to work under the influence of alcohol or drugs
- Smoking in prohibited areas

---

## 8. ANTI-CORRUPTION AND BRIBERY

8.1 Employees shall not offer, accept, or solicit bribes or corrupt payments.

8.2 Gifts and hospitality must be:
- Reasonable and appropriate
- Properly recorded
- Approved by management where required

8.3 Report any attempted bribery immediately.

---

## 9. DISCIPLINARY PROCEDURES

9.1 Violations of this Code may result in disciplinary action in accordance with the Code of Practice on Discipline (Employment Act, 2023).

9.2 Disciplinary measures may include:
- Verbal warning
- Written warning
- Final written warning
- Suspension
- Demotion
- Dismissal

9.3 Employees have the right to:
- Be informed of allegations
- Respond before action is taken
- Representation during hearings
- Appeal disciplinary decisions

---

## 10. REPORTING VIOLATIONS

10.1 Employees are encouraged to report violations through:
- Direct supervisor
- Human Resources department
- Anonymous reporting channels

10.2 Whistleblowers shall be protected from retaliation.

---

## ACKNOWLEDGMENT

I, **{{employee_name}}**, acknowledge that I have received, read, and understood this Code of Conduct. I agree to comply with all its provisions and understand that violation may result in disciplinary action, including termination of employment.

**Employee Signature:** _________________________

**Date:** _______________

---

🇸🇱 **{{company_name}}** | Republic of Sierra Leone
`,
    placeholders: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "version", label: "Version", type: "text", required: true },
      { key: "employee_name", label: "Employee Name", type: "text", required: true }
    ]
  },

  privacy_policy: {
    name: "Employee Privacy Policy",
    content: `
# EMPLOYEE PRIVACY POLICY

## {{company_name}}

### Republic of Sierra Leone

---

**Effective Date:** {{effective_date}}

---

## 1. INTRODUCTION

{{company_name}} ("the Company", "we", "us") is committed to protecting the privacy of our employees. This Privacy Policy explains how we collect, use, store, and protect your personal information in accordance with applicable laws of Sierra Leone.

---

## 2. INFORMATION WE COLLECT

### 2.1 Personal Identification Information
- Full name and date of birth
- National identification number
- Passport details (where applicable)
- Photographs

### 2.2 Contact Information
- Home address
- Telephone numbers
- Email addresses
- Emergency contact details

### 2.3 Employment Information
- Employment history
- Educational qualifications
- Professional certifications
- References

### 2.4 Financial Information
- Bank account details
- NASSIT registration number
- Tax identification number
- Salary and benefits information

### 2.5 Health Information
- Medical certificates
- Disability information (where disclosed)
- Sick leave records

---

## 3. HOW WE USE YOUR INFORMATION

We use your personal information for:

3.1 **Employment Administration**
- Payroll processing
- Benefits administration
- Leave management
- Performance reviews

3.2 **Legal Compliance**
- NASSIT contributions
- PAYE tax remittance
- Employment Act compliance
- National Revenue Authority reporting

3.3 **Business Operations**
- Communication
- Training and development
- Health and safety management
- Security and access control

---

## 4. DATA SHARING

4.1 We may share your information with:
- National Social Security and Insurance Trust (NASSIT)
- National Revenue Authority (NRA)
- Banks and financial institutions (for payroll)
- Insurance providers (for benefits)
- Government authorities (as required by law)

4.2 We will not sell or rent your personal information to third parties.

---

## 5. DATA SECURITY

5.1 We implement appropriate security measures including:
- Secure storage systems
- Access controls
- Encryption where appropriate
- Regular security assessments

5.2 Access to personal data is limited to authorized personnel only.

---

## 6. DATA RETENTION

6.1 We retain personal information for the duration of employment and as required by law thereafter.

6.2 Employment records are retained for a minimum of 7 years after termination.

---

## 7. YOUR RIGHTS

You have the right to:

7.1 Access your personal information held by us.

7.2 Request correction of inaccurate information.

7.3 Request information about how your data is used.

7.4 Lodge a complaint regarding data handling.

---

## 8. CHANGES TO THIS POLICY

We may update this Privacy Policy from time to time. Employees will be notified of significant changes.

---

## ACKNOWLEDGMENT

I, **{{employee_name}}**, acknowledge that I have read and understood this Privacy Policy and consent to the collection, use, and processing of my personal information as described herein.

**Employee Signature:** _________________________

**Date:** _______________

---

🇸🇱 **{{company_name}}** | Republic of Sierra Leone
`,
    placeholders: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "employee_name", label: "Employee Name", type: "text", required: true }
    ]
  },

  health_safety_policy: {
    name: "Health & Safety Policy",
    content: `
# OCCUPATIONAL HEALTH AND SAFETY POLICY

## {{company_name}}

### Republic of Sierra Leone

---

**Effective Date:** {{effective_date}}

---

## 1. POLICY STATEMENT

{{company_name}} is committed to providing a safe and healthy working environment for all employees, contractors, visitors, and members of the public who may be affected by our operations. This policy is issued in compliance with Sierra Leone's health and safety regulations.

---

## 2. EMPLOYER RESPONSIBILITIES

The Company shall:

2.1 Provide and maintain a safe working environment.

2.2 Provide necessary safety equipment and protective gear.

2.3 Ensure machinery and equipment are safe to use.

2.4 Provide adequate training on health and safety.

2.5 Conduct regular risk assessments.

2.6 Maintain first aid facilities.

2.7 Report serious accidents to relevant authorities.

---

## 3. EMPLOYEE RESPONSIBILITIES

All employees shall:

3.1 Take reasonable care of their own health and safety.

3.2 Not endanger the health and safety of others.

3.3 Use safety equipment and protective gear as provided.

3.4 Report hazards, accidents, and near-misses immediately.

3.5 Follow safety procedures and instructions.

3.6 Not interfere with or misuse safety equipment.

3.7 Attend required health and safety training.

---

## 4. HAZARD IDENTIFICATION AND RISK MANAGEMENT

4.1 Regular workplace inspections shall be conducted.

4.2 All hazards shall be documented and assessed.

4.3 Control measures shall be implemented promptly.

4.4 Employees are encouraged to report potential hazards.

---

## 5. ACCIDENT AND INCIDENT REPORTING

5.1 All accidents, injuries, and near-misses must be reported immediately.

5.2 An Accident Report Form must be completed within 24 hours.

5.3 Serious accidents shall be investigated and reported to authorities.

5.4 Corrective actions shall be implemented to prevent recurrence.

---

## 6. EMERGENCY PROCEDURES

6.1 Emergency evacuation procedures are displayed in all areas.

6.2 Fire drills shall be conducted regularly.

6.3 Employees must familiarize themselves with emergency exits.

6.4 First aid kits are located throughout the premises.

---

## 7. PERSONAL PROTECTIVE EQUIPMENT (PPE)

7.1 PPE shall be provided free of charge where required.

7.2 Employees must use PPE as instructed.

7.3 Report damaged or worn PPE for replacement.

---

## 8. PROHIBITED ACTIVITIES

The following are strictly prohibited:

8.1 Working under the influence of alcohol or drugs.

8.2 Smoking in prohibited areas.

8.3 Horseplay or reckless behavior.

8.4 Tampering with safety equipment.

8.5 Operating equipment without authorization.

---

## 9. TRAINING

9.1 All new employees shall receive safety induction training.

9.2 Regular refresher training shall be provided.

9.3 Specialized training for high-risk activities.

---

## ACKNOWLEDGMENT

I, **{{employee_name}}**, acknowledge that I have read and understood this Health and Safety Policy and agree to comply with all its provisions.

**Employee Signature:** _________________________

**Date:** _______________

---

🇸🇱 **{{company_name}}** | Republic of Sierra Leone
`,
    placeholders: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "employee_name", label: "Employee Name", type: "text", required: true }
    ]
  },

  nda: {
    name: "Non-Disclosure Agreement",
    content: `
# NON-DISCLOSURE AGREEMENT

## REPUBLIC OF SIERRA LEONE

---

**This Non-Disclosure Agreement** ("Agreement") is entered into on **{{effective_date}}** between:

**DISCLOSING PARTY:**
{{company_name}}
{{company_address}}

**RECEIVING PARTY:**
{{employee_name}}
{{employee_position}}

---

## 1. DEFINITION OF CONFIDENTIAL INFORMATION

"Confidential Information" includes all information disclosed by the Company that is:

1.1 Trade secrets, business plans, and strategies.

1.2 Customer lists and client information.

1.3 Financial data and pricing information.

1.4 Technical data, formulas, and processes.

1.5 Employee information and personnel records.

1.6 Any information marked as "Confidential" or "Proprietary".

---

## 2. OBLIGATIONS OF RECEIVING PARTY

The Receiving Party agrees to:

2.1 Keep all Confidential Information strictly confidential.

2.2 Not disclose Confidential Information to any third party.

2.3 Use Confidential Information only for authorized business purposes.

2.4 Return or destroy all Confidential Information upon request.

---

## 3. EXCEPTIONS

This Agreement does not apply to information that:

3.1 Was already known to the Receiving Party.

3.2 Becomes publicly available through no fault of the Receiving Party.

3.3 Is required to be disclosed by law or court order.

---

## 4. TERM

4.1 This Agreement shall remain in effect during employment and for a period of **{{confidentiality_years}}** years thereafter.

---

## 5. REMEDIES

5.1 Breach of this Agreement may result in disciplinary action, including termination.

5.2 The Company may seek injunctive relief and damages for any breach.

---

## 6. GOVERNING LAW

This Agreement shall be governed by the laws of the Republic of Sierra Leone.

---

## SIGNATURES

**FOR THE COMPANY:**

Signature: _________________________

Name: {{issuer_name}}

Position: {{issuer_position}}

Date: {{issue_date}}

---

**EMPLOYEE:**

Signature: _________________________

Name: {{employee_name}}

Date: _______________

---

🇸🇱 **Republic of Sierra Leone**
`,
    placeholders: [
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "company_address", label: "Company Address", type: "text", required: true },
      { key: "employee_name", label: "Employee Name", type: "text", required: true },
      { key: "employee_position", label: "Employee Position", type: "text", required: true },
      { key: "confidentiality_years", label: "Years of Confidentiality (after employment)", type: "number", required: true },
      { key: "issuer_name", label: "Issuer Name", type: "text", required: true },
      { key: "issuer_position", label: "Issuer Position", type: "text", required: true },
      { key: "issue_date", label: "Issue Date", type: "date", required: true }
    ]
  },

  leave_policy: {
    name: "Leave Policy",
    content: `
# LEAVE POLICY

## {{company_name}}

### Republic of Sierra Leone

---

**Effective Date:** {{effective_date}}

In accordance with the **Employment Act, 2023** of Sierra Leone

---

## 1. ANNUAL LEAVE

1.1 **Entitlement:** {{annual_leave_days}} working days per year after one year of continuous service.

1.2 **Accrual:** Leave accrues proportionally throughout the year.

1.3 **Request:** Submit leave requests at least 2 weeks in advance.

1.4 **Approval:** Subject to operational requirements and supervisor approval.

1.5 **Carry Forward:** Maximum {{carry_forward_days}} days may be carried to the following year.

1.6 **Payment:** Unused leave shall be paid upon termination.

---

## 2. SICK LEAVE

2.1 **Entitlement:** {{sick_leave_days}} days paid sick leave per year.

2.2 **Medical Certificate:** Required for absences of 3 or more consecutive days.

2.3 **Notification:** Inform supervisor as early as possible on the first day of absence.

2.4 **Extended Illness:** Beyond entitlement may be unpaid or covered by annual leave.

---

## 3. MATERNITY LEAVE

Per Section 49 of the Employment Act, 2023:

3.1 **Entitlement:** 14 weeks (98 calendar days) with full pay.

3.2 **Eligibility:** All female employees.

3.3 **Timing:** May commence 4 weeks before expected delivery date.

3.4 **Extension:** Additional unpaid leave may be granted upon request.

3.5 **Job Protection:** Guaranteed return to same or equivalent position.

---

## 4. PATERNITY LEAVE

4.1 **Entitlement:** 5 working days with full pay.

4.2 **Timing:** Within 14 days of child's birth.

4.3 **Documentation:** Birth certificate or notification required.

---

## 5. COMPASSIONATE LEAVE

5.1 **Entitlement:** 5 working days with pay for:
- Death of immediate family member (spouse, parent, child, sibling)
- Serious illness of immediate family member

5.2 **Request:** Notify supervisor immediately and submit request upon return.

---

## 6. UNPAID LEAVE

6.1 May be granted at management discretion.

6.2 Maximum 30 days per year.

6.3 No salary or benefits accrue during unpaid leave.

---

## 7. PUBLIC HOLIDAYS

7.1 Employees are entitled to all gazetted public holidays in Sierra Leone.

7.2 Work on public holidays attracts 2.5x regular pay rate.

---

## ACKNOWLEDGMENT

I, **{{employee_name}}**, acknowledge that I have read and understood this Leave Policy.

**Employee Signature:** _________________________

**Date:** _______________

---

🇸🇱 **{{company_name}}** | Republic of Sierra Leone | Employment Act, 2023 Compliant
`,
    placeholders: [
      { key: "company_name", label: "Company Name", type: "text", required: true },
      { key: "effective_date", label: "Effective Date", type: "date", required: true },
      { key: "annual_leave_days", label: "Annual Leave Days", type: "number", required: true },
      { key: "carry_forward_days", label: "Max Carry Forward Days", type: "number", required: true },
      { key: "sick_leave_days", label: "Sick Leave Days", type: "number", required: true },
      { key: "employee_name", label: "Employee Name", type: "text", required: true }
    ]
  }
};

export function getDocumentTypeLabel(type) {
  return DOCUMENT_TYPES.find(d => d.value === type)?.label || type;
}

export function getDocumentTypeIcon(type) {
  return DOCUMENT_TYPES.find(d => d.value === type)?.icon || "File";
}