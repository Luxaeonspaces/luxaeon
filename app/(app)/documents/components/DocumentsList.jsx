import {
  getOtherTemplates,
  getTemplateGroups,
  getTemplates,
} from "./documents-data";

import DocumentGroup from "./DocumentGroup";

export default async function DocumentsList() {
  const files = await getTemplates();

  if (files.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No templates found. Ensure public/templates is present.
      </p>
    );
  }

  const groups = getTemplateGroups(files);
  const otherTemplates = getOtherTemplates(files);

  return (
    <div className="space-y-6">
      {groups.map((group) => {
        if (group.templates.length === 0) {
          return null;
        }

        return (
          <DocumentGroup
            key={group.title}
            title={group.title}
            templates={group.templates}
          />
        );
      })}

      {otherTemplates.length > 0 && (
        <DocumentGroup
          title="Other templates"
          templates={otherTemplates}
        />
      )}
    </div>
  );
}