import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { type Edits } from '@fs-card-engine';
import { getRouteApi, useNavigate } from '@tanstack/react-router';

import { Head } from '@/components/seo/head';
import { useTemplate } from '@/features/templates-browse';

import { cardQuery } from '../api/get-card';
import { type PersistCardPayload } from '../api/save-card';
import { useUpdateCard } from '../api/update-card';
import { CardBuilderShell } from '../components/card-builder-shell';
import { useCardEditorStore } from '../stores/card-editor-store';

const EMPTY_EDITS: Edits = {};

const routeApi = getRouteApi('/_authenticated/_customer/_card-builder');

interface EditCardPageProps {
  cardId: number;
}

export function EditCardPage({ cardId }: EditCardPageProps) {
  const navigate = useNavigate();
  const updateCard = useUpdateCard();
  const { data: card } = useSuspenseQuery(cardQuery.getOptions(cardId));
  const { templateId: searchTemplateId } = routeApi.useSearch();
  const hydrateSavedEdits = useCardEditorStore((s) => s.hydrateSavedEdits);

  const templateId = searchTemplateId ?? card.templateId;
  const useOriginalTemplate = templateId === card.templateId;

  const { data: selectedTemplate } = useTemplate({
    variables: templateId,
    enabled: !useOriginalTemplate,
  });

  const backTemplateId = useOriginalTemplate
    ? card.backTemplateId
    : (selectedTemplate?.backTemplateId ?? null);

  const frontEdits = card.editsJson ?? EMPTY_EDITS;
  const backEdits = card.backEditsJson ?? EMPTY_EDITS;

  useEffect(() => {
    hydrateSavedEdits(frontEdits, backEdits);
  }, [hydrateSavedEdits, frontEdits, backEdits]);

  const handleSave = (payload: PersistCardPayload) => {
    updateCard.mutate(
      { id: cardId, ...payload },
      {
        onSuccess: (savedCard) => {
          void navigate({
            to: '/card/$cardId',
            params: { cardId: String(savedCard.id) },
          });
        },
      }
    );
  };

  return (
    <>
      <Head title="Edit Card" description="Edit your custom card" />
      <CardBuilderShell
        key={`edit-card-builder-${cardId}`}
        templateId={templateId}
        backTemplateId={backTemplateId}
        isSaving={updateCard.isPending}
        onSave={handleSave}
      />
    </>
  );
}
