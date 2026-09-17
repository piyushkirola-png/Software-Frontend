import { Settings as SettingsIcon, Info } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-navy">
          Settings
        </h1>
        <p className="text-sm text-muted mt-1">
          Site configuration (coming soon)
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
        <SettingsIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <h2 className="font-bold text-navy mb-2">Settings Coming Soon</h2>
        <p className="text-sm text-muted max-w-md mx-auto">
          Site settings, GST configuration, SMTP credentials, and payment
          gateway keys will be editable from here in a future update.
        </p>

        <div className="mt-6 max-w-md mx-auto bg-soft rounded-lg p-4 text-left">
          <div className="flex items-start gap-2 text-xs text-muted">
            <Info size={14} className="text-brand mt-0.5 shrink-0" />
            <div>
              Currently, these settings are configured via{" "}
              <code className="bg-white px-1.5 py-0.5 rounded text-[10px]">
                .env
              </code>{" "}
              on the backend server:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>GST rate & seller state</li>
                <li>SMTP email credentials</li>
                <li>Payment gateway keys</li>
                <li>Invoice prefix</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}