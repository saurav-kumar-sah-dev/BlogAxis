export default function Pagination({ page, total, limit, onPrev, onNext }) {
  const hasPrev = page > 1;
  const hasNext = page * limit < total;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex justify-between items-center pt-4">
      <button disabled={!hasPrev} onClick={onPrev}
        className={`px-3 py-1.5 rounded ${hasPrev ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'}`}>
        Prev
      </button>
      <div className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</div>
      <button disabled={!hasNext} onClick={onNext}
        className={`px-3 py-1.5 rounded ${hasNext ? 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'}`}>
        Next
      </button>
    </div>
  );
}