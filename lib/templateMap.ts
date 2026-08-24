/**
 * Template variable mapping
 * Keys match placeholders used in Docs & Templates (Word) and PDF generators.
 * Values are resolved from project / invoice / client context.
 */

export type TemplateContext = {
  projectCode?: string | null;
  clientName?: string | null;
  projectName?: string | null;
  location?: string | null;
  stage?: string | null;
  status?: string | null;
  designFee?: number | null;
  amountPaid?: number | null;
  notes?: string | null;
  salesPersonName?: string | null;
  createdBy?: string | null;
  targetHandover?: string | null;
  clientAccessCode?: string | null;
  invoiceNo?: string | null;
  dueDate?: string | null;
  phase?: string | null;
  /** Line items for dynamic tables */
  lineItems?: { description: string; qty: number; unitPrice: number; amount: number }[];
  extraDescription?: string | null;
};

export const BRAND_VARS = {
  company_name: "LUXAEON SPACES",
  company_tagline: "an interior company",
  company_phone: "+2349021144350",
  company_email: "luxaeonspaces@gmail.com",
  company_location: "Lagos, Nigeria",
  company_social: "Instagram/Tiktok- luxaeon_spaces",
  founder_name: "Oluwabukunmi OMISORE",
  founder_title: "Founder / Principal Designer",
  account_name: "Luxaeon Spaces / Oluwabukunmi OMISORE",
};

function money(n: number | null | undefined) {
  return `₦${Number(n || 0).toLocaleString("en-NG")}`;
}

function longDate(d = new Date()) {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Flat map for docxtemplater / PDF — all string values */
export function buildTemplateVars(ctx: TemplateContext): Record<string, string | number | boolean | any[]> {
  const fee = Number(ctx.designFee || 0);
  const paid = Number(ctx.amountPaid || 0);
  const due = Math.max(0, fee - paid);
  const items =
    ctx.lineItems && ctx.lineItems.length
      ? ctx.lineItems
      : [
          {
            description: `Interior Design Professional Fee – ${ctx.phase || ctx.stage || "Design services"}`,
            qty: 1,
            unitPrice: fee,
            amount: fee,
          },
        ];

  return {
    ...BRAND_VARS,
    // Common aliases matching Word template [PLACEHOLDERS]
    CLIENT_FULL_NAME: ctx.clientName || "",
    client_name: ctx.clientName || "",
    PROJECT_NAME: ctx.projectName || ctx.location || ctx.projectCode || "",
    project_name: ctx.projectName || "",
    project_code: ctx.projectCode || "",
    PROJECT_CODE: ctx.projectCode || "",
    location: ctx.location || "",
    stage: ctx.stage || "",
    status: ctx.status || "",
    notes: ctx.notes || "",
    sales_person: ctx.salesPersonName || "",
    created_by: ctx.createdBy || "",
    target_handover: ctx.targetHandover || "",
    access_code: ctx.clientAccessCode || "",

    // Dates
    DATE: longDate(),
    date: longDate(),
    DUE_DATE: ctx.dueDate || longDate(new Date(Date.now() + 14 * 86400000)),
    due_date: ctx.dueDate || longDate(new Date(Date.now() + 14 * 86400000)),

    // Money
    AMOUNT: money(fee),
    amount: money(fee),
    amount_raw: fee,
    design_fee: money(fee),
    PREVIOUS_PAYMENTS: money(paid),
    previous_payments: money(paid),
    amount_paid: money(paid),
    AMOUNT_DUE: money(due),
    amount_due: money(due),
    deposit_50: money(fee * 0.5),
    milestone_30: money(fee * 0.3),
    final_20: money(fee * 0.2),

    // Invoice
    INV_NO: ctx.invoiceNo || `INV-${ctx.projectCode || Date.now()}`,
    invoice_no: ctx.invoiceNo || `INV-${ctx.projectCode || Date.now()}`,
    phase: ctx.phase || ctx.stage || "Design services",

    // Dynamic table rows for docxtemplater loops: {#items}...{/items}
    items: items.map((i) => ({
      description: i.description,
      qty: i.qty,
      unit_price: money(i.unitPrice),
      amount: money(i.amount),
      unit_price_raw: i.unitPrice,
      amount_raw: i.amount,
    })),

    extra_description: ctx.extraDescription || "",
    // numeric helpers
    balance: money(due),
    balance_raw: due,
  };
}

/** Which Word file in public/templates maps to which generator type */
export const TEMPLATE_FILES: Record<string, string> = {
  invoice: "06_Invoice_Template.docx",
  proposal: "04_Project_Proposal.docx",
  status: "09_Project_Status_Update.docx",
  changeorder: "08_Change_Order.docx",
  handover: "10_Handover_Package.docx",
  agreement: "05_Service_Agreement.docx",
  brief: "03_Design_Brief_Questionnaire.docx",
  onboarding: "07_Welcome_Onboarding_Package.docx",
};
