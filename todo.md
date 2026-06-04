TODOs for Toast & Icons Migration

1. Global Toast Provider
   - Added frontend/src/lib/ToastContext.jsx to centralize toast usage.
   - Wrapped App with ToastProvider in main.jsx.

2. Toast component
   - Enhanced toast to support 'success' and 'error' types with icons and colors.

3. Pages updated to use toasts
   - Admin.jsx now uses Toast via local state; will be migrated to useToast in next step.
   - RemedyDetail.jsx shows toast for save action.

4. Icon replacements
   - Replaced several emoji usages with lucide-react icons (ArrowLeft, AlertTriangle, DownloadCloud, CheckCircle, Check, Globe, etc.).

Open tasks
 - Replace remaining console.error usages with toast notifications where appropriate.
 - Migrate Admin page to use useToast() from ToastContext for cleaner code.
 - Update Admin action buttons to include icons for visual parity with design.
 - Add unit/UI tests for toast behavior.
 - Ensure i18n keys are used where necessary instead of hardcoded English messages.
 - Replace remaining console.error usages with toast notifications where appropriate (some done).
 - Migrate remaining pages to use localized i18n toast messages (done for Admin and RemedyDetail).
 - Add icons to Admin action buttons and list items for improved UX.
 - Add unit/UI tests for toast behavior.
