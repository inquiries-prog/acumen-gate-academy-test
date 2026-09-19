"use client";

import { useState, useTransition } from "react";
import ImageField from "@/components/admin/ImageField";
import { SaveButton, StatusMessage } from "@/components/admin/Fields";
import { saveSiteSettings, type ActionResult } from "@/lib/admin/actions";
import type { SiteSettings } from "@/lib/types";

/**
 * Site-wide settings (SRS 6.2, 6.3, 7.1.1, 9.2).
 *
 * Grouped into the sections a non-technical person thinks in: the strip at the
 * top of the site, the first thing visitors read, and how to contact us.
 */
export default function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [, startTransition] = useTransition();

  function handleSave(formData: FormData) {
    startTransition(async () => {
      setStatus(await saveSiteSettings(formData));
    });
  }

  return (
    <form action={handleSave} className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Banner, hero &amp; contact details</h1>
        <p className="mt-1.5 text-sm text-body">
          Everything here appears on every page of the website.
        </p>
      </header>

      <StatusMessage status={status} />

      <Section
        title="Announcement banner"
        description="The thin strip below the menu. Reuse it for any campaign — a scholarship test, a deadline reminder — just change the words and turn it on."
      >
        <Checkbox
          name="banner_enabled"
          label="Show the banner"
          defaultChecked={settings.banner_enabled}
          help="Turning this off hides it for everyone."
        />
        <Text name="banner_text" label="Banner message" defaultValue={settings.banner_text} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text
            name="banner_link_label"
            label="Link text"
            defaultValue={settings.banner_link_label}
            help='e.g. "Know more". Leave blank for no link.'
          />
          <Select
            name="banner_link_action"
            label="What the link opens"
            defaultValue={settings.banner_link_action}
            options={[
              { value: "seminar", label: "The seminar offer form" },
              { value: "enquiry", label: "The enquiry form" },
              { value: "url", label: "A page on the website" },
              { value: "none", label: "Nothing — plain text only" },
            ]}
          />
        </div>
        <Text
          name="banner_link_url"
          label="Page address"
          defaultValue={settings.banner_link_url}
          help='Only used when the link opens a page. e.g. /results'
        />
      </Section>

      <Section
        title="The first thing visitors read"
        description="The large heading at the top of the homepage, and the red line underneath it. Keep them saying different things."
      >
        <Text name="hero_headline" label="Main heading" defaultValue={settings.hero_headline} />
        <Text name="hero_tagline" label="Red line below it" defaultValue={settings.hero_tagline} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="hero_primary_cta" label="Red button text" defaultValue={settings.hero_primary_cta} />
          <Text
            name="hero_secondary_cta"
            label="Second button text"
            defaultValue={settings.hero_secondary_cta}
          />
        </div>
        <Text
          name="stat_line"
          label="The big red number line"
          defaultValue={settings.stat_line}
          help="This is the only headline number used anywhere on the site. Don't add a second, different total elsewhere — inconsistent numbers hurt credibility with Google and with parents."
        />
      </Section>

      <Section title="Closing section" description="The dark band near the bottom of most pages.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="final_cta_heading" label="Heading" defaultValue={settings.final_cta_heading} />
          <Text name="final_cta_button" label="Button text" defaultValue={settings.final_cta_button} />
        </div>
      </Section>

      <Section title="Contact details" description="Used in the menu, the footer and the chat widget.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Text name="phone" label="Phone number" defaultValue={settings.phone} />
          <Text name="email" label="Email address" defaultValue={settings.email} />
        </div>
        <Text name="footer_tagline" label="Footer tagline" defaultValue={settings.footer_tagline} />
      </Section>

      <Section title="Logo" description="Used in the menu and, on a white background, in the footer.">
        <ImageField
          name="logo_url"
          label="Acumen Gate Academy logo"
          value={settings.logo_url}
          folder="logo"
          help="Upload the original logo file. Don't upload a recoloured version — the real colours are used everywhere."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageField
            name="acumen360_logo_url"
            label="Acumen 360 logo"
            value={settings.acumen360_logo_url}
            folder="logo"
            help="Shown as a footer badge."
          />
          <ImageField
            name="etude360_logo_url"
            label="Etude 360 logo"
            value={settings.etude360_logo_url}
            folder="logo"
            help="Shown as a footer badge."
          />
        </div>
      </Section>

      <Section title="Social media & reviews" description="Icons in the footer. Leave blank to hide one.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Text name="instagram_url" label="Instagram link" defaultValue={settings.instagram_url} />
          <Text name="youtube_url" label="YouTube link" defaultValue={settings.youtube_url} />
          <Text name="facebook_url" label="Facebook link" defaultValue={settings.facebook_url} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Text name="google_rating" label="Google rating" defaultValue={settings.google_rating} />
          <Text
            name="google_reviews_count"
            label="Number of reviews"
            defaultValue={settings.google_reviews_count}
          />
          <Text
            name="google_reviews_url"
            label="Link to your Google reviews"
            defaultValue={settings.google_reviews_url}
          />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 border-t border-line bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <SaveButton />
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-5">
      <h2 className="text-base font-bold">{title}</h2>
      {description && <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Text({
  name,
  label,
  defaultValue,
  help,
}: {
  name: string;
  label: string;
  defaultValue: string;
  help?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <input id={name} name={name} defaultValue={defaultValue} className="field" />
      {help && <p className="mt-1.5 text-xs text-muted">{help}</p>}
    </div>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={name} className="field-label">
        {label}
      </label>
      <select id={name} name={name} defaultValue={defaultValue} className="field">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
  help,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
  help?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-white p-3.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="mt-0.5 h-5 w-5 shrink-0 accent-[#E31E24]"
      />
      <span>
        <span className="block text-sm font-semibold text-charcoal">{label}</span>
        {help && <span className="mt-0.5 block text-xs text-muted">{help}</span>}
      </span>
    </label>
  );
}
