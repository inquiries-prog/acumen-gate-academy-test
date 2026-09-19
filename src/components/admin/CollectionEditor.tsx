"use client";

import { useState, useTransition } from "react";
import { Field, SaveButton, StatusMessage } from "./Fields";
import { deleteCollectionRow, saveCollectionRow, type ActionResult } from "@/lib/admin/actions";
import type { CollectionDef } from "@/lib/admin/collections";

type Row = Record<string, unknown>;

/**
 * The one editor screen behind every content list in the admin panel.
 *
 * Rows are listed compactly; clicking one expands it into a labelled form with
 * a Save button. Nothing about this screen is specific to a particular table -
 * it is driven entirely by the collection definition, which is what keeps all
 * twelve content sections consistent for a non-technical user (SRS 9.1).
 */
export default function CollectionEditor({
  def,
  rows,
}: {
  def: CollectionDef;
  rows: Row[];
}) {
  const pk = def.pk ?? "id";
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const canCreate = def.allowCreate !== false;
  const canDelete = def.allowDelete !== false;
  const editableFields = def.fields.filter((f) => !f.hidden);

  function handleSave(id: string | null, formData: FormData) {
    startTransition(async () => {
      const result = await saveCollectionRow(def.slug, id, formData);
      setStatus(result);
      if (result.ok) {
        setOpenId(null);
        setCreating(false);
      }
    });
  }

  function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete "${label}"? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteCollectionRow(def.slug, id);
      setStatus(result);
      if (result.ok) setOpenId(null);
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">{def.title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">{def.description}</p>
      </header>

      {def.notice && (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {def.notice}
        </p>
      )}

      <StatusMessage status={status} />

      {canCreate && !creating && (
        <button
          type="button"
          onClick={() => {
            setCreating(true);
            setOpenId(null);
          }}
          className="btn-primary"
        >
          + Add a {def.singular}
        </button>
      )}

      {creating && (
        <div className="card p-5">
          <h2 className="mb-4 text-base font-bold">New {def.singular}</h2>
          <form action={(fd) => handleSave(null, fd)} className="space-y-4">
            {editableFields.map((field) => (
              <Field key={field.name} field={field} value={defaultFor(field.name)} folder={def.slug} />
            ))}
            <div className="flex gap-2 border-t border-line pt-4">
              <SaveButton label={`Add ${def.singular}`} />
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line bg-offwhite px-5 py-10 text-center text-sm text-body">
          Nothing here yet.{canCreate && ` Use "Add a ${def.singular}" to create the first one.`}
        </p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((row) => {
            const id = String(row[pk]);
            const open = openId === id;
            const title = String(row[def.titleField] ?? "").trim() || `(untitled ${def.singular})`;
            const subtitle = def.subtitleField ? String(row[def.subtitleField] ?? "") : "";
            const thumb = def.thumbField ? String(row[def.thumbField] ?? "") : "";

            return (
              <li key={id} className="card overflow-hidden">
                <div className="flex items-center gap-3 p-3.5">
                  {def.thumbField && (
                    <div className="grid h-12 w-16 shrink-0 place-items-center overflow-hidden rounded border border-line bg-offwhite">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumb} alt="" className="h-full w-full object-contain" />
                      ) : (
                        <span className="text-[10px] text-muted">No image</span>
                      )}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-charcoal">{title}</p>
                    {subtitle && <p className="truncate text-xs text-muted">{subtitle}</p>}
                  </div>

                  {row.visible === false && (
                    <span className="shrink-0 rounded bg-offwhite px-2 py-1 text-[11px] font-bold text-muted">
                      Hidden
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(open ? null : id);
                      setCreating(false);
                    }}
                    className="btn-secondary shrink-0"
                  >
                    {open ? "Close" : "Edit"}
                  </button>
                </div>

                {open && (
                  <div className="border-t border-line bg-offwhite/50 p-5">
                    <form action={(fd) => handleSave(id, fd)} className="space-y-4">
                      {editableFields.map((field) => (
                        <Field
                          key={field.name}
                          field={field}
                          value={row[field.name]}
                          folder={def.slug}
                        />
                      ))}
                      <div className="flex flex-wrap gap-2 border-t border-line pt-4">
                        <SaveButton />
                        <button
                          type="button"
                          onClick={() => setOpenId(null)}
                          className="btn-secondary"
                        >
                          Cancel
                        </button>
                        {canDelete && (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => handleDelete(id, title)}
                            className="btn-ghost ml-auto text-red hover:bg-red/5"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Sensible starting values when adding a new row. */
function defaultFor(fieldName: string): unknown {
  if (fieldName === "visible" || fieldName === "published" || fieldName === "show_address") {
    return true;
  }
  if (fieldName === "show_in_carousel") return true;
  if (fieldName === "published_at") return new Date().toISOString().slice(0, 10);
  return "";
}
