"use client";

import { useState, useRef } from "react";
import { FIELD_DEFINITIONS } from "@/lib/format-definitions";
import type { FieldSlug, FieldLayoutItem } from "@/lib/format-definitions";

export type { FieldLayoutItem };

const HEADER_SLUGS: FieldSlug[] = [
  "class_name", "week_date", "teacher_name", "enrollment_count", "month_plan_week",
];

function buildDefault(
  activeFields: FieldSlug[],
  existing?: FieldLayoutItem[],
): { header: FieldLayoutItem[]; content: FieldLayoutItem[] } {
  const headers = activeFields.filter(f => HEADER_SLUGS.includes(f));
  const contents = activeFields.filter(f => !HEADER_SLUGS.includes(f));
  return {
    header: headers.map(slug => {
      const ex = existing?.find(e => e.slug === slug);
      return { slug, colSpan: ex?.colSpan ?? 2 };
    }),
    content: contents.map(slug => {
      const ex = existing?.find(e => e.slug === slug);
      return { slug, colSpan: ex?.colSpan ?? 4 };
    }),
  };
}

interface Props {
  activeFields: FieldSlug[];
  initialLayout?: FieldLayoutItem[];
  onSave: (layout: FieldLayoutItem[]) => void;
  saving?: boolean;
  saveLabel?: string;
}

export function FormatLayoutEditor({ activeFields, initialLayout, onSave, saving, saveLabel }: Props) {
  const { header: initHeader, content: initContent } = buildDefault(activeFields, initialLayout);
  const [headerLayout, setHeaderLayout] = useState<FieldLayoutItem[]>(initHeader);
  const [contentLayout, setContentLayout] = useState<FieldLayoutItem[]>(initContent);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const dragIndex = useRef<number | null>(null);

  const setHeaderColSpan = (slug: FieldSlug, colSpan: 1 | 2 | 3 | 4) =>
    setHeaderLayout(prev => prev.map(l => l.slug === slug ? { ...l, colSpan } : l));

  const setContentColSpan = (slug: FieldSlug, colSpan: 1 | 2 | 3 | 4) =>
    setContentLayout(prev => prev.map(l => l.slug === slug ? { ...l, colSpan } : l));

  const handleDragStart = (index: number) => { dragIndex.current = index; };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(index);
  };

  const handleDrop = (dropIndex: number) => {
    if (dragIndex.current !== null && dragIndex.current !== dropIndex) {
      const next = [...contentLayout];
      const [moved] = next.splice(dragIndex.current, 1);
      next.splice(dropIndex, 0, moved);
      setContentLayout(next);
    }
    setDragOver(null);
    dragIndex.current = null;
  };

  const handleDragEnd = () => {
    setDragOver(null);
    dragIndex.current = null;
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-center" style={{ color: "#9A8878" }}>
        ドラッグで順番を変え、数字ボタンで幅（1〜4列）を調整できます
      </p>

      <div
        className="rounded-2xl p-4 space-y-4"
        style={{ background: "rgba(255,255,255,0.72)", border: "1px solid rgba(255,183,178,0.2)" }}
      >
        {/* Header fields */}
        {headerLayout.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2 px-1" style={{ color: "#C4B4A4", letterSpacing: "0.06em" }}>
              ヘッダー（固定・幅のみ変更可）
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {headerLayout.map(({ slug, colSpan }) => (
                <FieldBlock
                  key={slug}
                  slug={slug}
                  colSpan={colSpan}
                  color="#D1E8E2"
                  accentColor="#7ABCAA"
                  draggable={false}
                  onColSpan={span => setHeaderColSpan(slug, span)}
                />
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px dashed rgba(255,183,178,0.3)" }} />

        {/* Content fields */}
        <div>
          <p className="text-xs font-medium mb-2 px-1" style={{ color: "#C4B4A4", letterSpacing: "0.06em" }}>
            内容（ドラッグで並び替え・幅変更可）
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
            {contentLayout.map(({ slug, colSpan }, i) => (
              <FieldBlock
                key={slug}
                slug={slug}
                colSpan={colSpan}
                color="#FFB7B2"
                accentColor="#D08880"
                draggable
                isDragOver={dragOver === i}
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                onColSpan={span => setContentColSpan(slug, span)}
              />
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={() => onSave([...headerLayout, ...contentLayout])}
        disabled={saving}
        className="w-full py-3 rounded-2xl text-sm font-medium transition-all disabled:opacity-50 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #FFB7B2, #ffcac6)",
          color: "#4A4A4A",
          boxShadow: "0 2px 12px rgba(255,183,178,0.35)",
        }}
      >
        {saving ? "保存中..." : (saveLabel ?? "このレイアウトで保存する")}
      </button>
    </div>
  );
}

interface FieldBlockProps {
  slug: FieldSlug;
  colSpan: 1 | 2 | 3 | 4;
  color: string;
  accentColor: string;
  draggable: boolean;
  isDragOver?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: () => void;
  onDragEnd?: () => void;
  onColSpan: (span: 1 | 2 | 3 | 4) => void;
}

function FieldBlock({
  slug, colSpan, color, accentColor, draggable, isDragOver,
  onDragStart, onDragOver, onDrop, onDragEnd, onColSpan,
}: FieldBlockProps) {
  const def = FIELD_DEFINITIONS[slug];
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      style={{
        gridColumn: `span ${colSpan}`,
        background: isDragOver ? `${color}35` : `${color}18`,
        border: `1.5px solid ${isDragOver ? accentColor : color}70`,
        borderRadius: 10,
        padding: "10px 12px",
        cursor: draggable ? "grab" : "default",
        transition: "all 0.15s",
        userSelect: "none",
        minWidth: 0,
      }}
    >
      <div className="flex items-center gap-1.5 mb-2">
        {draggable && (
          <span style={{ color: `${accentColor}`, flexShrink: 0, opacity: 0.6 }}>
            <DragIcon />
          </span>
        )}
        <p className="text-xs font-medium truncate flex-1" style={{ color: "#4A4A4A" }}>
          {def.label}
        </p>
      </div>
      <div className="flex gap-1">
        {([1, 2, 3, 4] as const).map(s => (
          <button
            key={s}
            onClick={() => onColSpan(s)}
            className="text-[10px] rounded cursor-pointer transition-all flex-1 text-center py-0.5"
            style={{
              background: colSpan === s ? accentColor : "rgba(255,255,255,0.7)",
              color: colSpan === s ? "white" : "#B4A494",
              border: `1px solid ${colSpan === s ? accentColor : "rgba(200,190,180,0.4)"}`,
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function DragIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="3" cy="2" r="1" fill="currentColor" />
      <circle cx="7" cy="2" r="1" fill="currentColor" />
      <circle cx="3" cy="5" r="1" fill="currentColor" />
      <circle cx="7" cy="5" r="1" fill="currentColor" />
      <circle cx="3" cy="8" r="1" fill="currentColor" />
      <circle cx="7" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}
