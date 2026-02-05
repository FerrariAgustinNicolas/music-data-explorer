interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="glass rounded-2xl p-6">
      <p className="text-red-300">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-glow text-ink font-semibold px-4 py-2"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
};

export default ErrorState;
