export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <div className="w-14 h-14 border-4 border-[#8FB7CC] border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-500 tracking-wide">Loading...</p>
    </div>
  );
}
