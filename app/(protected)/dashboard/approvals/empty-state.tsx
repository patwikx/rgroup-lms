interface EmptyStateProps {
    title: string;
    description: string;
  }
  
  export function EmptyState({ title, description }: EmptyStateProps) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
        <h3 className="mt-2 text-lg font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    );
  }