import SettingsForm from "./SettingsForm";
import { getSiteSettings } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Banner, hero & contact details",
  robots: { index: false, follow: false },
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsForm settings={settings} />;
}
