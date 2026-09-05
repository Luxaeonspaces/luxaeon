export default function ClientPortalForm({ code, access }) {
  return (
    <form
      className="glass-card grid gap-3 p-5 md:grid-cols-3"
      action="/client-portal"
      method="get"
    >
      <input
        name="code"
        className="input"
        placeholder="Project code"
        defaultValue={code}
      />

      <input
        name="access"
        className="input"
        placeholder="Access code"
        defaultValue={access}
      />

      <button
        className="btn-primary"
        type="submit"
      >
        View status
      </button>
    </form>
  );
}