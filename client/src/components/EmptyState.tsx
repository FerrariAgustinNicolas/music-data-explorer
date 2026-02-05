interface EmptyStateProps {
  message: string;
}

const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <div className="glass rounded-2xl p-6 text-slate-300" data-testid="empty-state">
      {message}
    </div>
  );
};

export default EmptyState;
