import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { getRouteApi, Link, useNavigate } from '@tanstack/react-router';
import { useQueryClient } from '@tanstack/react-query';
import {
  ActionIcon,
  Anchor,
  Badge,
  Button,
  Group,
  Image,
  Menu,
  SimpleGrid,
  Skeleton,
  Table,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  Edit,
  Expand,
  Eye,
  Grid2x2,
  GripVertical,
  List,
  MoreHorizontal,
  PenLine,
  Plus,
  SlidersHorizontal,
  Star,
  Tags,
} from 'lucide-react';

import type { Column } from '@/components/ui/data-table';
import {
  ListingShell,
  ListingPagination,
  useListingContext,
  type ListingTab,
} from '@/components/ui/listing';
import { usePageHeader } from '@/hooks/use-page-header';
import { formatDate } from '@/utils/date';

import { useTemplates } from '../api/get-templates';
import { useReorderTemplates } from '../api/reorder-templates';
import { useSetDefaultBack } from '../api/set-default-back';
import type { Template, TemplateSide, TemplatesListResponse } from '../types';

import { TemplateRow } from './template-row';
import { SetTagsModal } from './set-tags-modal';
import { TemplatePreviewModal } from './template-preview-modal';
import styles from './templates-list.module.css';

const routeApi = getRouteApi('/_authenticated/admin/_listing/templates');

type ViewMode = 'grid' | 'list';

const TABS: ListingTab[] = [
  { value: 'front', label: 'Front Sides' },
  { value: 'back', label: 'Back Sides' },
];

const FRONT_COLUMNS: Column[] = [
  { label: '', width: 40 },
  { label: 'Front', width: 80 },
  { label: 'Back', width: 80 },
  { label: 'Label' },
  { label: 'Published', width: 100 },
  { label: 'Description' },
  { label: 'Tags' },
  { label: 'Created', width: 150 },
  { label: 'Actions', width: 60 },
];

const BACK_COLUMNS: Column[] = [
  { label: '', width: 40 },
  { label: 'Preview', width: 80 },
  { label: 'Label' },
  { label: 'Published', width: 100 },
  { label: 'Description' },
  { label: 'Tags' },
  { label: 'Created', width: 150 },
  { label: 'Actions', width: 60 },
];

/* ─── Shared action menu ─── */

function TemplateActions({
  template,
  side,
  size = 'md',
  onSetTags,
  onSetDefaultBack,
}: {
  template: Template;
  side: TemplateSide;
  size?: 'sm' | 'md';
  onSetTags: (template: Template) => void;
  onSetDefaultBack: (template: Template) => void;
}) {
  return (
    <Menu shadow="md" width={160} position="bottom-end">
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray" size={size}>
          <MoreHorizontal size={size === 'sm' ? 14 : 16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          component={Link}
          to={`/admin/templates/${template.id}`}
          leftSection={<Eye size={14} />}
        >
          View
        </Menu.Item>
        <Menu.Item
          component={Link}
          to={`/admin/templates/${template.id}/edit`}
          leftSection={<Edit size={14} />}
        >
          Edit
        </Menu.Item>
        <Menu.Item
          component={Link}
          to={`/admin/templates/${template.id}/annotate`}
          leftSection={<PenLine size={14} />}
        >
          Annotate
        </Menu.Item>
        <Menu.Item
          component={Link}
          to={`/admin/templates/${template.id}/defaults`}
          leftSection={<SlidersHorizontal size={14} />}
        >
          Edit Defaults
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          leftSection={<Tags size={14} />}
          onClick={() => onSetTags(template)}
        >
          Set Tags
        </Menu.Item>
        {side === 'back' && (
          <Menu.Item
            leftSection={<Star size={14} />}
            onClick={() => onSetDefaultBack(template)}
          >
            Set as Default Back
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

/* ─── Grid view components ─── */

function BackThumbPreview({ template }: { template: Template }) {
  const backTemplate = template.backTemplate ?? template.defaultBackTemplate;
  if (!backTemplate) return null;

  const isDefault =
    !template.backTemplate && Boolean(template.defaultBackTemplate);

  return (
    <Anchor
      component={Link}
      to={`/admin/templates/${backTemplate.id}`}
      className={`${styles.backThumb} ${isDefault ? styles.backThumbDefault : ''}`}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      title={`${isDefault ? 'Default back' : 'Back'}: ${backTemplate.name}`}
    >
      <img
        src={backTemplate.templateImageMedium}
        alt={`Back: ${backTemplate.name}`}
        className={styles.backThumbImg}
        loading="lazy"
        decoding="async"
      />
    </Anchor>
  );
}

function TemplateCard({
  template,
  side,
  onSetTags,
  onSetDefaultBack,
  onPreview,
  onNavigate,
}: {
  template: Template;
  side: TemplateSide;
  onSetTags: (template: Template) => void;
  onSetDefaultBack: (template: Template) => void;
  onPreview: (template: Template) => void;
  onNavigate: (template: Template) => void;
}) {
  const handleCardClick = () => {
    onNavigate(template);
  };

  return (
    <div
      className={styles.card}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
    >
      <div className={styles.imageWrap}>
        <Image
          src={template.templateImageMedium}
          alt={template.label}
          fit="contain"
          h="100%"
          w="100%"
        />
        <ActionIcon
          className={styles.enlargeBtn}
          variant="filled"
          color="dark"
          size={36}
          radius="xl"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            onPreview(template);
          }}
          aria-label={`Preview ${template.label}`}
        >
          <Expand size={18} />
        </ActionIcon>
        {side === 'front' && <BackThumbPreview template={template} />}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <Text fw={600} size="sm" lineClamp={1}>
            {template.label}
          </Text>
          <div onClick={(e) => e.stopPropagation()}>
            <TemplateActions
              template={template}
              side={side}
              size="sm"
              onSetTags={onSetTags}
              onSetDefaultBack={onSetDefaultBack}
            />
          </div>
        </div>
        <Group gap={4}>
          <Badge
            variant="light"
            color={template.isPublished ? 'green' : 'gray'}
            size="xs"
          >
            {template.isPublished ? 'Published' : 'Draft'}
          </Badge>
          {template.isDefaultBack && (
            <Badge size="xs" variant="light" color="yellow">
              Default
            </Badge>
          )}
          {template.tags.map((tag) => (
            <Badge key={tag.id} variant="light" size="xs">
              {tag.label}
            </Badge>
          ))}
        </Group>
        <Text size="xs" c="dimmed">
          {formatDate(template.createdAt)}
        </Text>
      </div>
    </div>
  );
}

function SortableGridCard({
  template,
  side,
  onSetTags,
  onSetDefaultBack,
  onPreview,
  onNavigate,
}: {
  template: Template;
  side: TemplateSide;
  onSetTags: (template: Template) => void;
  onSetDefaultBack: (template: Template) => void;
  onPreview: (template: Template) => void;
  onNavigate: (template: Template) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.sortableItem}>
      <button
        type="button"
        className={styles.dragHandle}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={14} />
      </button>
      <TemplateCard
        template={template}
        side={side}
        onSetTags={onSetTags}
        onSetDefaultBack={onSetDefaultBack}
        onPreview={onPreview}
        onNavigate={onNavigate}
      />
    </div>
  );
}

const GRID_COLS = { base: 2, xs: 3, sm: 4, md: 5, lg: 6 } as const;

function GridSkeleton() {
  return (
    <SimpleGrid cols={GRID_COLS} spacing="md">
      {Array.from({ length: 12 }).map((_, i) => (
        // eslint-disable-next-line react-x/no-array-index-key
        <div key={i} className={styles.card}>
          <Skeleton h={200} radius={0} />
          <div className={styles.cardBody}>
            <Skeleton height={16} width="60%" />
            <Skeleton height={14} width="40%" />
            <Skeleton height={12} width="30%" />
          </div>
        </div>
      ))}
    </SimpleGrid>
  );
}

/* ─── List view components ─── */

function SortableListRow({
  template,
  side,
  onSetTags,
  onSetDefaultBack,
}: {
  template: Template;
  side: TemplateSide;
  onSetTags: (template: Template) => void;
  onSetDefaultBack: (template: Template) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: template.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Table.Tr ref={setNodeRef} style={style}>
      <Table.Td w={40}>
        <ActionIcon
          variant="subtle"
          color="gray"
          style={{ cursor: 'grab' }}
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </ActionIcon>
      </Table.Td>
      <TemplateRow
        template={template}
        side={side}
        onSetTags={onSetTags}
        onSetDefaultBack={onSetDefaultBack}
      />
    </Table.Tr>
  );
}

function TableSkeleton({ columns }: { columns: Column[] }) {
  return (
    <Table.Tbody>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        // eslint-disable-next-line react-x/no-array-index-key
        <Table.Tr key={rowIndex}>
          {columns.map((column) => (
            <Table.Td key={column.label || 'drag'}>
              <Skeleton height={20} width={column.width ?? '70%'} />
            </Table.Td>
          ))}
        </Table.Tr>
      ))}
    </Table.Tbody>
  );
}

/* ─── Main component ─── */

export function TemplatesList() {
  const { page, limit, search, setPage, setLimit } = useListingContext();
  const { side, view } = routeApi.useSearch();
  const navigate = useNavigate();
  const [tagsOpened, { open: openTags, close: closeTags }] =
    useDisclosure(false);
  const [previewOpened, { open: openPreview, close: closePreview }] =
    useDisclosure(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    Template | undefined
  >();
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  usePageHeader({
    title: 'Templates',
    description: 'Manage your card templates.',
  });

  const setDefaultBackMutation = useSetDefaultBack();
  const reorderMutation = useReorderTemplates();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSetDefaultBack = (template: Template) => {
    setDefaultBackMutation.mutate(template.id);
  };

  const handleSetTags = (template: Template) => {
    setSelectedTemplate(template);
    openTags();
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    openPreview();
  };

  const handleNavigate = (template: Template) => {
    void navigate({ to: `/admin/templates/${template.id}` });
  };

  const handleTabChange = (value: string | null) => {
    if (value) {
      void navigate({
        to: '.',
        search: (prev) => ({ ...prev, side: value as TemplateSide, page: 1 }),
      });
    }
  };

  const toggleView = () => {
    const next: ViewMode = view === 'grid' ? 'list' : 'grid';
    void navigate({
      to: '.',
      search: (prev) => ({ ...prev, view: next }),
    });
  };

  const columns = side === 'front' ? FRONT_COLUMNS : BACK_COLUMNS;

  const queryResult = useTemplates({
    variables: {
      page,
      limit,
      search: search || undefined,
      side,
    },
  });

  const templates = queryResult.data?.data ?? [];
  const meta = queryResult.data?.meta;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = templates.findIndex((t) => t.id === active.id);
    const newIndex = templates.findIndex((t) => t.id === over.id);
    const newOrder = arrayMove(templates, oldIndex, newIndex);

    // Optimistic update
    const queryKey = useTemplates.getKey({
      page,
      limit,
      search: search || undefined,
      side,
    });
    const previous = queryClient.getQueryData(queryKey);
    void queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData(
      queryKey,
      (old: TemplatesListResponse | undefined) => {
        if (!old) return old;
        return { ...old, data: newOrder };
      }
    );

    reorderMutation.mutate(
      newOrder.map((t) => t.id),
      {
        onError: () => queryClient.setQueryData(queryKey, previous),
        onSettled: () => void queryClient.invalidateQueries({ queryKey }),
      }
    );
  };

  const isGrid = view === 'grid';

  return (
    <>
      <SetTagsModal
        key={selectedTemplate?.id}
        template={selectedTemplate}
        opened={tagsOpened}
        onClose={closeTags}
      />
      <TemplatePreviewModal
        template={previewTemplate}
        opened={previewOpened}
        onClose={closePreview}
      />
      <ListingShell
        actions={
          <Group gap="xs">
            <ActionIcon.Group>
              <ActionIcon
                variant={isGrid ? 'filled' : 'default'}
                size="lg"
                onClick={isGrid ? undefined : toggleView}
                aria-label="Grid view"
              >
                <Grid2x2 size={16} />
              </ActionIcon>
              <ActionIcon
                variant={!isGrid ? 'filled' : 'default'}
                size="lg"
                onClick={!isGrid ? undefined : toggleView}
                aria-label="List view"
              >
                <List size={16} />
              </ActionIcon>
            </ActionIcon.Group>
            <Button
              component={Link}
              to="/admin/templates/create"
              leftSection={<Plus size={16} />}
            >
              Create Template
            </Button>
          </Group>
        }
        tabs={TABS}
        activeTab={side}
        onTabChange={handleTabChange}
        showFilter={false}
      >
        <div className="flex flex-col gap-4">
          {queryResult.isLoading ? (
            isGrid ? (
              <GridSkeleton />
            ) : (
              <Table horizontalSpacing="md" verticalSpacing="sm">
                <Table.Thead>
                  <Table.Tr>
                    {columns.map((column) => (
                      <Table.Th key={column.label || 'drag'} w={column.width}>
                        {column.label}
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <TableSkeleton columns={columns} />
              </Table>
            )
          ) : templates.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              No templates found
            </Text>
          ) : isGrid ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={templates.map((t) => t.id)}
                strategy={rectSortingStrategy}
              >
                <SimpleGrid cols={GRID_COLS} spacing="md">
                  {templates.map((template) => (
                    <SortableGridCard
                      key={template.id}
                      template={template}
                      side={side}
                      onSetTags={handleSetTags}
                      onSetDefaultBack={handleSetDefaultBack}
                      onPreview={handlePreview}
                      onNavigate={handleNavigate}
                    />
                  ))}
                </SimpleGrid>
              </SortableContext>
            </DndContext>
          ) : (
            <Table horizontalSpacing="md" verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  {columns.map((column) => (
                    <Table.Th key={column.label || 'drag'} w={column.width}>
                      {column.label}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={templates.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <Table.Tbody>
                    {templates.map((template) => (
                      <SortableListRow
                        key={template.id}
                        template={template}
                        side={side}
                        onSetTags={handleSetTags}
                        onSetDefaultBack={handleSetDefaultBack}
                      />
                    ))}
                  </Table.Tbody>
                </SortableContext>
              </DndContext>
            </Table>
          )}

          {meta && (
            <ListingPagination
              meta={meta}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={setLimit}
            />
          )}
        </div>
      </ListingShell>
    </>
  );
}
