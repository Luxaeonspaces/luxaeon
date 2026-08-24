/**
 * Fill Word templates from public/templates with LIVE project data.
 * Supports:
 *  1) Bracket placeholders: [CLIENT FULL NAME], [AMOUNT], etc. (current Luxaeon templates)
 *  2) docxtemplater {variable} syntax if present
 */
import { readFile } from "fs/promises";
import path from "path";
import { buildTemplateVars, TEMPLATE_FILES, type TemplateContext } from "./templateMap";

/** Map common [BRACKET] tokens in the Word templates → live values */
function bracketReplacements(vars: Record<string, any>): [RegExp | string, string][] {
  const s = (k: string) => String(vars[k] ?? "");
  return [
    [/\[CLIENT FULL NAME\]/gi, s("client_name")],
    [/\[CLIENT NAME\]/gi, s("client_name")],
    [/\[PROJECT NAME \/ ADDRESS\]/gi, s("PROJECT_NAME")],
    [/\[PROJECT NAME\]/gi, s("project_name") || s("PROJECT_NAME")],
    [/\[PROJECT CODE\]/gi, s("project_code")],
    [/\[INV-2026-001\]/gi, s("invoice_no")],
    [/\[INV-[^\]]+\]/gi, s("invoice_no")],
    [/\[DD MONTH YYYY\]/gi, s("date")],
    [/\[DATE\]/gi, s("date")],
    [/\[AMOUNT\]/gi, s("amount")],
    [/\[X–Y weeks\]/gi, "4–8 weeks"],
    [/\[X-Y weeks\]/gi, "4–8 weeks"],
    [/\[Phase \/ Milestone\]/gi, s("phase")],
    [/\[Phase \/ Milestone\]/gi, s("phase")],
    [/\[Your Bank\]/gi, "[Your Bank]"],
    [/\[XXXXXXXXXX\]/gi, "[Account number]"],
    [/\[email\]/gi, s("company_email")],
    [/\[phone\]/gi, s("company_phone")],
    [/\[briefly restate the project goal in 2–4 sentences\]/gi, s("notes") || `Interior design services for ${s("client_name")}.`],
    // bare placeholders that appear in status template
    [/_{5,}/g, "________________"],
  ];
}

export async function fillDocxTemplate(
  type: string,
  ctx: TemplateContext
): Promise<{ buffer: Buffer; filename: string }> {
  let PizZip: any;
  try {
    PizZip = (await import("pizzip")).default;
  } catch {
    throw new Error("pizzip not installed. Run: npm install pizzip docxtemplater");
  }

  const file = TEMPLATE_FILES[type];
  if (!file) throw new Error(`No Word template mapped for type "${type}"`);

  const templatePath = path.join(process.cwd(), "public", "templates", file);
  const content = await readFile(templatePath, "binary");
  const zip = new PizZip(content);
  const vars = buildTemplateVars(ctx);

  // --- 1) Replace [BRACKET] placeholders inside word/document.xml ---
  const docXmlPath = "word/document.xml";
  let xml: string = zip.file(docXmlPath)?.asText() || "";
  if (!xml) throw new Error("Invalid Word template (no document.xml)");

  for (const [pattern, value] of bracketReplacements(vars)) {
    xml = xml.replace(pattern as any, escapeXml(value));
  }

  // Also replace plain tokens that may appear without brackets in some exports
  const plain: Record<string, string> = {
    CLIENT_FULL_NAME: String(vars.client_name || ""),
    PROJECT_CODE: String(vars.project_code || ""),
  };
  for (const [k, v] of Object.entries(plain)) {
    if (v) xml = xml.split(k).join(escapeXml(v));
  }

  zip.file(docXmlPath, xml);

  // --- 2) Optional docxtemplater pass for {curly} placeholders ---
  try {
    const Docxtemplater = (await import("docxtemplater")).default;
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      nullGetter: () => "",
    });
    doc.render(vars);
    const buf = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
    return {
      buffer: Buffer.from(buf),
      filename: `Luxaeon_${type}_${ctx.projectCode || "filled"}.docx`,
    };
  } catch {
    // Bracket replacement alone is enough for current templates
    const buf = zip.generate({ type: "nodebuffer", compression: "DEFLATE" });
    return {
      buffer: Buffer.from(buf),
      filename: `Luxaeon_${type}_${ctx.projectCode || "filled"}.docx`,
    };
  }
}

function escapeXml(s: string) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Load full project into TemplateContext for live fill */
export async function contextFromProjectCode(
  projectCode: string,
  extra?: Partial<TemplateContext>
): Promise<TemplateContext> {
  const { prisma } = await import("./prisma");
  const project = await prisma.project.findUnique({ where: { projectCode } });
  if (!project) throw new Error(`Project ${projectCode} not found`);
  return {
    projectCode: project.projectCode,
    clientName: project.clientName,
    projectName: project.projectName,
    location: project.location,
    stage: project.stage,
    status: project.status,
    designFee: project.designFee,
    amountPaid: project.amountPaid,
    notes: project.notes,
    salesPersonName: project.salesPersonName,
    createdBy: project.createdBy,
    targetHandover: project.targetHandover,
    clientAccessCode: project.clientAccessCode,
    phase: project.stage,
    ...extra,
  };
}
