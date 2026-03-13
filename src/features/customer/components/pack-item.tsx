import { ActionIcon, Button, Menu, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  Check,
  ChevronDown,
  Copy,
  MoreVertical,
  Pencil,
  SquarePen,
  Trash2,
  X,
} from 'lucide-react';
import { useCallback, useState } from 'react';
import { MdOutlineShoppingCart } from 'react-icons/md';

import { CardSidePreview } from '@/components/card-side-preview';
import type { Pack } from '@/types';

import { useUpdatePack } from '../api/update-pack';
import { formatDate } from '../utils/format-date';

import { DeletePackModal } from './delete-pack-modal';
import { PackAddMoreBanner } from './pack-add-more-banner';
import { PackCardsPreview } from './pack-cards-preview';
import styles from './pack-item.module.css';
import type { ViewMode } from './view-toggle';

interface PackItemProps {
  pack: Pack;
  variant?: ViewMode;
  onAddToCart?: (pack: Pack) => void;
  onPreview?: () => void;
  onEdit?: (pack: Pack) => void;
  onCopy?: (pack: Pack) => void;
  readOnly?: boolean;
}

function getTotalQuantity(pack: Pack): number {
  return pack.packCards.reduce((sum, pc) => sum + pc.quantity, 0);
}

export function PackItem({
  pack,
  variant = 'list',
  onAddToCart,
  onPreview,
  onEdit,
  onCopy,
  readOnly = false,
}: PackItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(pack.name);
  const [
    deleteModalOpened,
    { open: openDeleteModal, close: closeDeleteModal },
  ] = useDisclosure(false);
  const editInputRef = useCallback((node: HTMLInputElement | null) => {
    if (node) {
      node.focus();
      node.select();
    }
  }, []);

  const updatePack = useUpdatePack();

  const firstCard = pack.packCards[0]?.card;
  const hasMultipleCards = pack.packCards.length > 1;
  const totalQuantity = getTotalQuantity(pack);

  const handleStartEditing = () => {
    setEditingName(pack.name);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setEditingName(pack.name);
    setIsEditing(false);
  };

  const handleSaveEditing = () => {
    if (!editingName.trim() || editingName === pack.name) {
      handleCancelEditing();
      return;
    }

    updatePack.mutate(
      { id: pack.id, name: editingName.trim() },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditing();
    }
  };

  return (
    <div
      className={`${styles.container} ${styles[variant]} ${readOnly ? styles.readOnly : ''}`}
    >
      <div className={styles.mainContent}>
        <button
          type="button"
          className={styles.thumbnail}
          onClick={onPreview}
          disabled={readOnly}
        >
          {firstCard ? (
            <CardSidePreview
              card={firstCard}
              className={styles.thumbnailImage}
              badgeSize="xs"
            />
          ) : (
            <div className={styles.thumbnailPlaceholder} />
          )}
        </button>

        <div className={styles.info}>
          <div className={styles.titleRow}>
            {isEditing && !readOnly ? (
              <>
                <TextInput
                  ref={editInputRef}
                  value={editingName}
                  onChange={(e) => setEditingName(e.currentTarget.value)}
                  onKeyDown={handleKeyDown}
                  size="sm"
                  className={styles.editNameInput}
                  classNames={{ input: styles.editNameInputInner }}
                />
                <div className={styles.editActions}>
                  <ActionIcon
                    variant="filled"
                    color="green"
                    size="sm"
                    onClick={handleSaveEditing}
                    loading={updatePack.isPending}
                  >
                    <Check size={16} color="white" />
                  </ActionIcon>
                  <ActionIcon
                    variant="filled"
                    color="red"
                    size="sm"
                    onClick={handleCancelEditing}
                    disabled={updatePack.isPending}
                  >
                    <X size={16} color="white" />
                  </ActionIcon>
                </div>
              </>
            ) : (
              <>
                <Text
                  fw={600}
                  size="lg"
                  c="white"
                  m={0}
                  className={styles.name}
                >
                  {pack.name}
                </Text>
                {!readOnly && (
                  <Menu
                    shadow="md"
                    width={180}
                    position="bottom-end"
                    classNames={{ dropdown: styles.menuDropdown }}
                  >
                    <Menu.Target>
                      <ActionIcon
                        variant="transparent"
                        size="lg"
                        className={styles.menuButton}
                      >
                        <MoreVertical size={20} />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item
                        leftSection={<Pencil size={14} />}
                        onClick={() => onEdit?.(pack)}
                      >
                        Edit Pack
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<SquarePen size={14} />}
                        onClick={handleStartEditing}
                      >
                        Rename Pack
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<Copy size={14} />}
                        onClick={() => onCopy?.(pack)}
                      >
                        Copy Pack
                      </Menu.Item>
                      <Menu.Item
                        leftSection={<Trash2 size={14} />}
                        onClick={openDeleteModal}
                      >
                        Delete Pack
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </>
            )}
          </div>
          <div className={styles.dateRow}>
            <span className={styles.statusDot} />
            <Text size="sm" c="dimmed" m={0}>
              Created: {formatDate(pack.createdAt)}
            </Text>
          </div>
          {!readOnly && (
            <div className={styles.actionsRow}>
              {hasMultipleCards && (
                <button
                  type="button"
                  className={styles.viewCardsButton}
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  <span>View Cards</span>
                  <ChevronDown
                    size={16}
                    className={`${styles.chevron} ${isExpanded ? styles.open : ''}`}
                  />
                </button>
              )}
              <Button
                variant="outline"
                size="sm"
                radius="xl"
                leftSection={<MdOutlineShoppingCart size={16} />}
                onClick={() => onAddToCart?.(pack)}
                className={styles.addToCartButton}
              >
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>

      {!readOnly && hasMultipleCards && (
        <div
          className={`${styles.expandedContentWrapper} ${isExpanded ? styles.open : ''}`}
        >
          <div
            className={`${styles.expandedContent} ${isExpanded ? styles.open : ''}`}
          >
            <PackCardsPreview cards={pack.packCards.map((pc) => pc.card)} />
          </div>
        </div>
      )}

      {!readOnly && (
        <PackAddMoreBanner pack={pack} totalQuantity={totalQuantity} />
      )}

      {!readOnly && (
        <DeletePackModal
          pack={pack}
          opened={deleteModalOpened}
          onClose={closeDeleteModal}
        />
      )}
    </div>
  );
}
