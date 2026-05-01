function SOSButton({ onClick, loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={`inline-flex h-40 w-40 items-center justify-center rounded-full bg-red-600 text-3xl font-extrabold text-white shadow-2xl transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-80 ${
        loading ? "" : "animate-sos-pulse"
      }`}
    >
      {loading ? (
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      ) : (
        "SOS"
      )}
    </button>
  );
}

export default SOSButton;
