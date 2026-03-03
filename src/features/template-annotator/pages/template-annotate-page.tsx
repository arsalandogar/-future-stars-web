import { useNavigate } from '@tanstack/react-router';

import { useUpdateTemplateSvgJson } from '@/features/templates';

import { useAnnotatorStore } from '../stores/annotator-store';
import { buildAnnotatedSvg } from '../utils/export-annotated-svg';
import { AnnotatorPage } from './annotator-page';

export function TemplateAnnotatePage({ id }: { id: number }) {
  const navigate = useNavigate();

  const updateSvgJson = useUpdateTemplateSvgJson();

  const handleSave = () => {
    const { svgTree, assignments } = useAnnotatorStore.getState();
    if (!svgTree) return;

    const annotated = buildAnnotatedSvg(svgTree, assignments);
    updateSvgJson.mutate(
      { id, svgJson: annotated },
      {
        onSuccess: () => {
          void navigate({
            to: '/admin/templates/$id',
            params: { id: String(id) },
          });
        },
      }
    );
  };

  return (
    <AnnotatorPage onSave={handleSave} isSaving={updateSvgJson.isPending} />
  );
}
