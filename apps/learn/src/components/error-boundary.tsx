"use client";

import { useState, useEffect, type ReactNode } from "react";
import { useI18n } from "@/lib/i18n";

export default function ErrorBoundary({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { t } = useI18n();
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.error) {
        setHasError(true);
        console.error("Unhandled error:", e.error);
      }
    };
    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="error-boundary">
          <div className="complete-card">
            <div className="big">⚠️</div>
            <h3>{t("error.title")}</h3>
            <p>{t("error.body")}</p>
            <button className="btn" onClick={() => window.location.reload()}>
              {t("error.refresh")}
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}
