import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

export function SectionPlaceholder({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-glow">
            {icon}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      <Card>
        <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center">
          <p className="text-sm font-medium">Coming soon in the next phase</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            The database is ready. The UI for this section will be built in a later phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
