import type React from "react";
import {Navigate, useLocation} from "@tryghost/admin-x-framework";
import {useOnboarding} from "@/onboarding/hooks/use-onboarding";

interface AnalyticsOnboardingRedirectProps {
    children: React.ReactNode;
}

export function AnalyticsOnboardingRedirect({children}: AnalyticsOnboardingRedirectProps) {
    const location = useLocation();
    const onboarding = useOnboarding();

    if (onboarding.isLoading) {
        return null;
    }

    if (onboarding.isChecklistShown) {
        const returnTo = `${location.pathname}${location.search}`;
        return <Navigate replace to={`/setup/onboarding?returnTo=${encodeURIComponent(returnTo)}`} />;
    }

    return children;
}
