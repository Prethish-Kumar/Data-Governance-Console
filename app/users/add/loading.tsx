// app/users/loading.tsx
export default function UsersLoading() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <p className="text-lg font-medium">Loading form...</p>
        <div className="mt-4 animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    </div>
  );
}
