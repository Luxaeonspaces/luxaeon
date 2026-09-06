import { getStaffProfile } from "./my-space-data";
import ReadOnlyField from "./ReadOnlyField";

export default async function EmployeeProfile({ user }) {
  const profile = await getStaffProfile(user.id);

  return (
    <section className="glass-card p-5">
      <h2 className="mb-3 font-display font-semibold text-burgundy">
        My documented profile
      </h2>

      <p className="mb-3 text-xs text-gray-500">
        Read-only · contact HR to update personal records
      </p>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <ReadOnlyField
          label="Full name"
          value={user.fullName}
        />

        <ReadOnlyField
          label="Username"
          value={user.username}
        />

        <ReadOnlyField
          label="Employee ID"
          value={profile?.employeeId}
        />

        <ReadOnlyField
          label="Job title"
          value={profile?.jobTitle}
        />

        <ReadOnlyField
          label="Phone"
          value={profile?.phone}
        />

        <ReadOnlyField
          label="Email"
          value={profile?.email}
        />

        <ReadOnlyField
          label="Date joined"
          value={profile?.dateJoined}
        />

        <ReadOnlyField
          label="Date of birth"
          value={profile?.dateOfBirth}
        />

        <ReadOnlyField
          label="Address"
          value={profile?.address}
        />

        <ReadOnlyField
          label="Next of kin"
          value={
            profile?.nokName
              ? `${profile.nokName} (${profile.nokRelationship || "—"}) ${profile.nokPhone || ""}`
              : undefined
          }
        />

        <ReadOnlyField
          label="Bank"
          value={
            profile?.bankName
              ? `${profile.bankName} · ${profile.bankAccount || ""}`
              : undefined
          }
        />

        <ReadOnlyField
          label="Skills"
          value={profile?.skills}
        />
      </div>
    </section>
  );
}