import { createLead } from "../actions";

export default function LeadForm({
  user,
  perms,
  salesPeople,
  message,
}) {
  return (
    <form
      key={message || "lead-create"}
      action={createLead}
      className="glass-card grid gap-3 p-5 md:grid-cols-2"
    >
      <h2 className="md:col-span-2 font-display font-semibold text-burgundy">
        Add lead
      </h2>

      <input
        name="fullName"
        className="input"
        placeholder="Full name *"
        required
      />

      <input
        name="email"
        type="email"
        className="input"
        placeholder="Email"
      />

      <input
        name="phone"
        type="tel"
        className="input"
        placeholder="Phone"
      />

      <input
        name="location"
        className="input"
        placeholder="Location"
      />

      <select name="source" className="input">
        {[
          "Instagram",
          "TikTok",
          "Referral",
          "WhatsApp",
          "Website",
          "Other",
        ].map((source) => (
          <option key={source}>{source}</option>
        ))}
      </select>

      <select name="status" className="input">
        {[
          "New",
          "Contacted",
          "Qualified",
          "Proposal Sent",
          "Won",
          "Lost",
          "Nurture",
        ].map((status) => (
          <option key={status}>{status}</option>
        ))}
      </select>

      <select
        name="ownerUserId"
        className="input"
        defaultValue={perms.isSales ? user.id : ""}
      >
        <option value="">Sales owner (optional)</option>

        {salesPeople.map((salesPerson) => (
          <option key={salesPerson.id} value={salesPerson.id}>
            {salesPerson.fullName}
          </option>
        ))}
      </select>

      <textarea
        name="notes"
        className="input md:col-span-2"
        placeholder="Message / notes (optional)"
        rows={3}
      />

      <button
        type="submit"
        className="btn-primary md:col-span-2"
      >
        Save lead
      </button>
    </form>
  );
}