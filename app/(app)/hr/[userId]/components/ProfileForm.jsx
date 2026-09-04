import AmountInput from "@/components/AmountInput";
import { saveProfile } from "../../actions";

function Section({ title, children }) {
  return (
    <div className="glass-card grid gap-3 p-5 md:grid-cols-2">
      <h2 className="md:col-span-2 font-display font-semibold text-brown">{title}</h2>
      {children}
    </div>
  );
}

function Field({ name, label, defaultValue, placeholder, type = "text", full }) {
  return (
    <label className={full ? "md:col-span-2 block text-sm" : "block text-sm"}>
      <span className="mb-1 block text-xs text-gray-500">{label}</span>
      <input name={name} type={type} className="input" defaultValue={defaultValue || ""} placeholder={placeholder} />
    </label>
  );
}

function Area({ name, label, defaultValue }) {
  return (
    <label className="md:col-span-2 block text-sm">
      <span className="mb-1 block text-xs text-gray-500">{label}</span>
      <textarea name={name} className="input" rows={3} defaultValue={defaultValue || ""} />
    </label>
  );
}

export default function ProfileForm({ employeeId, profile: p }) {
  return (
    <form action={saveProfile} className="space-y-4">
      <input type="hidden" name="userId" value={employeeId} />

      <Section title="Work identity">
        <Field name="employeeId" label="Employee ID" defaultValue={p?.employeeId} />
        <Field name="jobTitle" label="Job title" defaultValue={p?.jobTitle} />
        <Field name="dateJoined" label="Date joined" defaultValue={p?.dateJoined} placeholder="YYYY-MM-DD" />
        <Field name="phone" label="Phone" defaultValue={p?.phone} />
        <Field name="email" label="Email" defaultValue={p?.email} />
        <Field name="address" label="Address" defaultValue={p?.address} full />
        <Field name="bankName" label="Bank name" defaultValue={p?.bankName} />
        <Field name="bankAccount" label="Bank account" defaultValue={p?.bankAccount} />
        <label className="block text-sm">
          <span className="mb-1 block text-xs text-gray-500">Basic salary (₦)</span>
          <AmountInput name="salaryAmount" defaultValue={p?.salaryAmount ?? 0} />
        </label>
      </Section>

      <Section title="Personal details">
        <Field name="dateOfBirth" label="Date of birth" defaultValue={p?.dateOfBirth} placeholder="YYYY-MM-DD" />
        <Field name="gender" label="Gender" defaultValue={p?.gender} />
        <Field name="maritalStatus" label="Marital status" defaultValue={p?.maritalStatus} />
        <Field name="nationality" label="Nationality" defaultValue={p?.nationality} />
        <Field name="stateOfOrigin" label="State of origin" defaultValue={p?.stateOfOrigin} />
        <Field name="nin" label="NIN / ID number" defaultValue={p?.nin} />
      </Section>

      <Section title="Next of kin">
        <Field name="nokName" label="Full name" defaultValue={p?.nokName} />
        <Field name="nokRelationship" label="Relationship" defaultValue={p?.nokRelationship} />
        <Field name="nokPhone" label="Phone" defaultValue={p?.nokPhone} />
        <Field name="nokEmail" label="Email" defaultValue={p?.nokEmail} />
        <Field name="nokAddress" label="Address" defaultValue={p?.nokAddress} full />
      </Section>

      <Section title="Spouse details">
        <Field name="spouseName" label="Name" defaultValue={p?.spouseName} />
        <Field name="spousePhone" label="Phone" defaultValue={p?.spousePhone} />
        <Field name="spouseEmail" label="Email" defaultValue={p?.spouseEmail} />
        <Field name="spouseOccupation" label="Occupation" defaultValue={p?.spouseOccupation} />
      </Section>

      <Section title="Guarantor information">
        <Field name="guarantorName" label="Name" defaultValue={p?.guarantorName} />
        <Field name="guarantorRelationship" label="Relationship" defaultValue={p?.guarantorRelationship} />
        <Field name="guarantorPhone" label="Phone" defaultValue={p?.guarantorPhone} />
        <Field name="guarantorEmail" label="Email" defaultValue={p?.guarantorEmail} />
        <Field name="guarantorOccupation" label="Occupation" defaultValue={p?.guarantorOccupation} />
        <Field name="guarantorAddress" label="Address" defaultValue={p?.guarantorAddress} full />
      </Section>

      <Section title="Health status & history">
        <Field name="healthStatus" label="Current health status" defaultValue={p?.healthStatus} />
        <Field name="bloodGroup" label="Blood group" defaultValue={p?.bloodGroup} />
        <Field name="allergies" label="Allergies" defaultValue={p?.allergies} />
        <Field name="disabilities" label="Disabilities (if any)" defaultValue={p?.disabilities} />
        <Area name="healthHistory" label="Health history" defaultValue={p?.healthHistory} />
      </Section>

      <Section title="Work experience, skills, education">
        <Area name="workExperience" label="Work experience" defaultValue={p?.workExperience} />
        <Area name="skills" label="Skills" defaultValue={p?.skills} />
        <Area name="educationHistory" label="Education history" defaultValue={p?.educationHistory} />
        <Area name="certifications" label="Certifications" defaultValue={p?.certifications} />
        <Area name="notes" label="HR notes" defaultValue={p?.notes} />
      </Section>

      <button type="submit" className="btn-primary">
        Save employee profile
      </button>
    </form>
  );
}