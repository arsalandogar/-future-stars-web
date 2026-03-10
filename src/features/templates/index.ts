// Pages
export { TemplatesListPage } from './pages/templates-list-page';
export { TemplateViewPage } from './pages/template-view-page';
export { TemplateCreatePage } from './pages/template-create-page';
export { TemplateEditPage } from './pages/template-edit-page';

// Components
export { TemplateRow } from './components/template-row';

// API
export { templateQuery, useTemplate } from './api/get-template';
export { useTemplates } from './api/get-templates';
export {
  templateSvgJsonQuery,
  useTemplateSvgJson,
} from './api/get-template-svg-json';
export { useUpdateTemplateSvgJson } from './api/update-template-svg-json';
export { useSetDefaultBack } from './api/set-default-back';

// Types
export type { Template, TemplateSide } from './types';
export { EDITABLE_FIELDS } from './types';
export type { EditableFieldId, EditableFieldType } from './types';
