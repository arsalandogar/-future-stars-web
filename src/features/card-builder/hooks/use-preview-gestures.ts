import { useEffect, useRef } from 'react';

import type { EditableFieldId } from '@/features/templates';

import { useCardBuilderStore } from '../stores/card-builder-store';
import { useCardEditorStore } from '../stores/card-editor-store';
import {
  type Side,
  DEFAULT_IMAGE_POSITION,
  getEditValue,
  isImageEdit,
  TOUCH_TARGET_ATTR,
  TOUCH_TARGET_TYPE_ATTR,
  ZOOM_MIN,
  ZOOM_MAX,
} from '@fs-card-engine';
const WHEEL_SENSITIVITY = 0.001;
const DRAG_THRESHOLD = 3;

/** Attribute added to image-field elements via getNodeProps. */
export const IMAGE_FIELD_ATTR = 'data-image-field-id';

/**
 * Walk from the event target up to the container looking for an element
 * with the image field attribute.
 */
function resolveFieldId(
  target: EventTarget | null,
  container: HTMLElement
): string | null {
  let el = target as Element | null;
  while (el && el !== container) {
    const id = el.getAttribute(IMAGE_FIELD_ATTR);
    if (id) return id;
    // Also check touch target rects for image fields
    const touchTarget = el.getAttribute(TOUCH_TARGET_ATTR);
    if (touchTarget && el.getAttribute(TOUCH_TARGET_TYPE_ATTR) === 'image') {
      return touchTarget;
    }
    el = el.parentElement;
  }
  return null;
}

/** Check whether the given image field has a user-uploaded image. */
function fieldHasUpload(fieldId: string): boolean {
  const store = useCardEditorStore.getState();
  const sideState = store.sides[store.activeSide];
  const field = sideState.editableImageFields.find(
    (f) => f.fieldId === fieldId
  );
  if (!field) return false;
  const url = getEditValue(sideState.edits[fieldId as EditableFieldId]);
  return Boolean(url && url !== field.originalValue);
}

/** Compute the ratio from screen pixels to SVG user-units. */
function getSvgScale(container: HTMLElement): number {
  const svg = container.querySelector('svg');
  if (!svg) return 1;
  const vb = svg.viewBox.baseVal;
  if (!vb.width) return 1;
  const rect = svg.getBoundingClientRect();
  return vb.width / rect.width;
}

/** Apply a zoom delta to a field and select it in the builder panel. */
function applyZoomDelta(fieldId: string, delta: number): void {
  const store = useCardEditorStore.getState();
  const side = store.activeSide;
  const edit = store.sides[side].edits[fieldId as EditableFieldId];
  const pos = isImageEdit(edit) ? edit : DEFAULT_IMAGE_POSITION;
  const newZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, pos.zoom + delta));

  store.adjustImageZoom(
    fieldId as EditableFieldId,
    newZoom,
    pos.offsetX,
    pos.offsetY,
    side
  );

  useCardBuilderStore
    .getState()
    .setSelectedImageFieldId(fieldId as EditableFieldId);
}

interface DragState {
  fieldId: string;
  side: Side;
  lastX: number;
  lastY: number;
  hasMoved: boolean;
}

/**
 * Attaches wheel-to-zoom, pointer-drag-to-pan, and pinch-to-zoom gestures
 * on the card preview container for image fields that have a user upload.
 *
 * Returns:
 * - `previewRef` — attach to the preview wrapper element
 * - `wasDragRef` — ref that is `true` briefly after a drag so onClick handlers
 *   can skip firing
 */
export function usePreviewGestures() {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const wasDragRef = useRef(false);

  // Pinch-to-zoom tracking (touch events)
  const lastPinchDistRef = useRef<number | null>(null);
  const pinchFieldRef = useRef<string | null>(null);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;

    // ── Wheel zoom ──────────────────────────────────────────────
    function handleWheel(e: WheelEvent) {
      const fieldId = resolveFieldId(e.target, el!);
      if (!fieldId || !fieldHasUpload(fieldId)) return;

      e.preventDefault();
      applyZoomDelta(fieldId, -e.deltaY * WHEEL_SENSITIVITY);
    }

    // ── Pointer drag-to-pan ─────────────────────────────────────
    function handlePointerDown(e: PointerEvent) {
      if (e.button !== 0) return;
      const fieldId = resolveFieldId(e.target, el!);
      if (!fieldId || !fieldHasUpload(fieldId)) return;
      const side = useCardEditorStore.getState().activeSide;

      dragRef.current = {
        fieldId,
        side,
        lastX: e.clientX,
        lastY: e.clientY,
        hasMoved: false,
      };
      (e.target as Element).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent) {
      const drag = dragRef.current;
      if (!drag) return;

      const dx = e.clientX - drag.lastX;
      const dy = e.clientY - drag.lastY;

      if (!drag.hasMoved && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) {
        return;
      }

      drag.hasMoved = true;
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;

      const scale = getSvgScale(el!);
      useCardEditorStore
        .getState()
        .nudgeImagePosition(
          drag.fieldId as EditableFieldId,
          dx * scale,
          dy * scale,
          drag.side
        );
    }

    function handlePointerUp() {
      if (dragRef.current?.hasMoved) {
        wasDragRef.current = true;
        // Clear after the click event fires (next frame)
        requestAnimationFrame(() => {
          wasDragRef.current = false;
        });
      }
      dragRef.current = null;
    }

    // ── Touch pinch-to-zoom ─────────────────────────────────────
    function handleTouchStart(e: TouchEvent) {
      if (e.touches.length !== 2) return;
      const fieldId = resolveFieldId(e.touches[0].target, el!);
      if (!fieldId || !fieldHasUpload(fieldId)) return;

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistRef.current = Math.hypot(dx, dy);
      pinchFieldRef.current = fieldId;
    }

    function handleTouchMove(e: TouchEvent) {
      if (
        e.touches.length !== 2 ||
        lastPinchDistRef.current === null ||
        !pinchFieldRef.current
      ) {
        return;
      }

      e.preventDefault();

      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const delta = (dist - lastPinchDistRef.current) * 0.005;
      lastPinchDistRef.current = dist;

      applyZoomDelta(pinchFieldRef.current, delta);
    }

    function handleTouchEnd(e: TouchEvent) {
      if (e.touches.length < 2) {
        lastPinchDistRef.current = null;
        pinchFieldRef.current = null;
      }
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('pointerdown', handlePointerDown);
    el.addEventListener('pointermove', handlePointerMove);
    el.addEventListener('pointerup', handlePointerUp);
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('pointerdown', handlePointerDown);
      el.removeEventListener('pointermove', handlePointerMove);
      el.removeEventListener('pointerup', handlePointerUp);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  return { previewRef, wasDragRef };
}
