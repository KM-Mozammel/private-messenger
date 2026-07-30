import { useState } from "react";
import type { LogoutButtonProps } from "../../types/models";

export default function LogoutButton({ onLogout }: LogoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  // Close modal if user clicks on overlay
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Logout button */}
      <button
        onClick={() => setIsOpen(true)}
        className="
          bg-transparent
          border-none
          cursor-pointer
          font-semibold
          text-red-500
          hover:text-red-600
        "
      >
        Logout
      </button>

      {/* Confirmation modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-60 bg-black/30"
          onClick={handleOverlayClick} // <-- overlay click
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-gray-100">
              Confirm Logout
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => setIsOpen(false)}
                className="
                  px-4 py-2
                  rounded
                  bg-gray-200 dark:bg-gray-700
                  text-gray-800 dark:text-gray-200
                  hover:bg-gray-300 dark:hover:bg-gray-600
                "
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="
                  px-4 py-2
                  rounded
                  bg-red-500
                  text-white
                  hover:bg-red-600
                "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
