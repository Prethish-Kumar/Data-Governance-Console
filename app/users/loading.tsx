export default function UsersLoading() {
  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <p className="text-lg font-medium mb-4">Loading users...</p>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  );
}
