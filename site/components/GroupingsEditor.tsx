import { type CSSProperties } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToParentElement, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import * as Popover from "@radix-ui/react-popover";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { MAX_GROUPINGS, newId, type Grouping } from "../pages/parliament/url";

export interface GroupingsEditorProps {
  groupings: Grouping[];
  onChange: (next: Grouping[]) => void;
  /** Swatches offered in the colour picker (incumbent colours + teal). */
  presetColors: string[];
}

/**
 * The Custom-mode editor, styled to read like the read-only ResultsTable but
 * with editable cells: drag-to-reorder, an inline colour picker, an editable
 * name and seat count, plus add/remove. Rendered as a CSS grid of divs (not a
 * `<table>`) so a dragged row keeps its column widths.
 */
export function GroupingsEditor({ groupings, onChange, presetColors }: GroupingsEditorProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = groupings.findIndex((g) => g.id === active.id);
    const to = groupings.findIndex((g) => g.id === over.id);
    if (from === -1 || to === -1) return;
    onChange(arrayMove(groupings, from, to));
  };

  const patch = (id: string, p: Partial<Grouping>) =>
    onChange(groupings.map((g) => (g.id === id ? { ...g, ...p } : g)));

  const remove = (id: string) => onChange(groupings.filter((g) => g.id !== id));

  const add = () => {
    if (groupings.length >= MAX_GROUPINGS) return;
    const color = presetColors[groupings.length % presetColors.length] ?? "#888888";
    onChange([...groupings, { id: newId(), name: "New grouping", color, seats: 0 }]);
  };

  const total = groupings.reduce((sum, g) => sum + Math.max(0, Math.floor(g.seats) || 0), 0);
  const canRemove = groupings.length > 1;

  return (
    <div className="groupings-editor" role="table" aria-label="Groupings">
      <div className="ge-row ge-row--head" role="row">
        <span className="ge-cell ge-cell--handle" role="columnheader" aria-hidden="true" />
        <span className="ge-cell ge-cell--color" role="columnheader">
          Colour
        </span>
        <span className="ge-cell ge-cell--name" role="columnheader">
          Grouping
        </span>
        <span className="ge-cell ge-cell--seats" role="columnheader">
          Seats
        </span>
        <span className="ge-cell ge-cell--remove" role="columnheader" aria-hidden="true" />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={groupings.map((g) => g.id)} strategy={verticalListSortingStrategy}>
          {groupings.map((g) => (
            <GroupingRow
              key={g.id}
              grouping={g}
              canRemove={canRemove}
              presetColors={presetColors}
              onPatch={patch}
              onRemove={remove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="ge-foot">
        <button
          type="button"
          className="ge-add"
          onClick={add}
          disabled={groupings.length >= MAX_GROUPINGS}
        >
          + Add grouping
        </button>
        <span className="ge-total" aria-live="polite">
          {total} {total === 1 ? "seat" : "seats"}
        </span>
      </div>
    </div>
  );
}

interface GroupingRowProps {
  grouping: Grouping;
  canRemove: boolean;
  presetColors: string[];
  onPatch: (id: string, patch: Partial<Grouping>) => void;
  onRemove: (id: string) => void;
}

function GroupingRow({ grouping, canRemove, presetColors, onPatch, onRemove }: GroupingRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: grouping.id,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`ge-row${isDragging ? " is-dragging" : ""}`}
      role="row"
    >
      <span className="ge-cell ge-cell--handle" role="cell">
        {/* Drag listeners live on the handle ONLY, so the inputs/swatch keep
            normal focus and clicks. */}
        <button
          type="button"
          className="ge-handle"
          aria-label={`Reorder ${grouping.name}`}
          {...attributes}
          {...listeners}
        >
          ⠿
        </button>
      </span>

      <span className="ge-cell ge-cell--color" role="cell">
        <ColorCell
          color={grouping.color}
          name={grouping.name}
          presetColors={presetColors}
          onChange={(color) => onPatch(grouping.id, { color })}
        />
      </span>

      <span className="ge-cell ge-cell--name" role="cell">
        <input
          className="ge-input ge-input--name"
          value={grouping.name}
          aria-label="Grouping name"
          onChange={(e) => onPatch(grouping.id, { name: e.target.value })}
        />
      </span>

      <span className="ge-cell ge-cell--seats" role="cell">
        <input
          className="ge-input ge-input--seats"
          type="number"
          min={0}
          inputMode="numeric"
          aria-label={`Seats for ${grouping.name}`}
          value={Number.isFinite(grouping.seats) ? grouping.seats : 0}
          onChange={(e) => {
            const v = e.target.valueAsNumber;
            onPatch(grouping.id, { seats: Number.isNaN(v) ? 0 : Math.max(0, Math.floor(v)) });
          }}
        />
      </span>

      <span className="ge-cell ge-cell--remove" role="cell">
        <button
          type="button"
          className="ge-remove"
          aria-label={`Remove ${grouping.name}`}
          disabled={!canRemove}
          onClick={() => onRemove(grouping.id)}
        >
          ×
        </button>
      </span>
    </div>
  );
}

interface ColorCellProps {
  color: string;
  name: string;
  presetColors: string[];
  onChange: (color: string) => void;
}

function ColorCell({ color, name, presetColors, onChange }: ColorCellProps) {
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          className="ge-swatch"
          style={{ background: color }}
          aria-label={`Colour for ${name}`}
        />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="ge-color-popover"
          sideOffset={8}
          align="start"
          collisionPadding={12}
        >
          <HexColorPicker color={color} onChange={onChange} />
          <HexColorInput className="ge-hex-input" color={color} onChange={onChange} prefixed />
          <div className="ge-color-presets" role="listbox" aria-label="Preset colours">
            {presetColors.map((preset) => {
              const selected = preset.toLowerCase() === color.toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  aria-label={preset}
                  className={`ge-preset${selected ? " is-active" : ""}`}
                  style={{ background: preset }}
                  onClick={() => onChange(preset)}
                />
              );
            })}
          </div>
          <Popover.Arrow className="ge-color-arrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
