"use client";

import { useState, useTransition } from "react";
import { SaveButton, StatusMessage } from "@/components/admin/Fields";
import { saveAboutBlock, type ActionResult } from "@/lib/admin/actions";

interface Block {
  key: string;
  name: string;
  note: string;
  heading: string;
  body: string;
}

export default function AboutEditor({ blocks }: { blocks: Block[] }) {
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [, startTransition] = useTransition();

  function handleSave(key: string, formData: FormData) {
    startTransition(async () => {
      setStatus(await saveAboutBlock(key, formData));
    });
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold">About Us text</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-body">
          Write in plain, checkable facts rather than marketing language — this page is what search
          engines and AI assistants quote when someone asks about GATE coaching in Vadodara.
        </p>
      </header>

      <StatusMessage status={status} />

      {blocks.map((block) => (
        <form
          key={block.key}
          action={(fd) => handleSave(block.key, fd)}
          className="card space-y-4 p-5"
        >
          <div>
            <h2 className="text-base font-bold">{block.name}</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted">{block.note}</p>
          </div>

          <div>
            <label className="field-label">Section heading</label>
            <input name="heading" defaultValue={block.heading} className="field" />
          </div>

          <div>
            <label className="field-label">Text</label>
            <textarea
              name="body"
              rows={block.key === "opening" ? 6 : 12}
              defaultValue={block.body}
              className="field resize-y leading-relaxed"
            />
          </div>

          <div className="border-t border-line pt-4">
            <SaveButton />
          </div>
        </form>
      ))}
    </div>
  );
}
