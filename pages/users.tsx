import React, { useEffect, useState } from "react";
import { useUsers } from "../hooks/useUsers";

const SNAG = () => {
  const { data: usersData, error, isLoading } = useUsers();

  if (error) return <div className="pt-28 text-red-500">Error: {error}</div>;
  if (isLoading)
    return <div className="pt-28 text-white">Loading users...</div>;
  if (!usersData || !usersData.data)
    return <div className="pt-28 text-white">No user data available</div>;

  return (
    <div className="pt-28 px-4">
      <h1 className="text-white text-2xl font-bold mb-6">Users List</h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-white">Display Name</th>
              <th className="px-6 py-3 text-left text-white">Wallet Address</th>
            </tr>
          </thead>
          <tbody>
            {usersData.data.length > 0 ? (
              usersData.data.map((user) => (
                <tr
                  key={user.id}
                  className="border-t border-gray-700 hover:bg-gray-600"
                >
                  <td className="px-6 py-4 text-white">
                    {user.displayName || "N/A"}
                  </td>
                  <td className="px-6 py-4 text-white">
                    <span className="text-sm font-mono">
                      {user.walletAddress?.slice(0, 6)}...
                      {user.walletAddress?.slice(-4)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-white text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {usersData.hasNextPage && (
        <div className="mt-4 text-white text-center">
          More users available...
        </div>
      )}
    </div>
  );
};

export default SNAG;
