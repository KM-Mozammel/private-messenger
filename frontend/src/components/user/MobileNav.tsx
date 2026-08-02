import React from "react";

interface MobileNavProps {
    toggleMobileHome: string;
    setToggleMobileHome: React.Dispatch<React.SetStateAction<string>>;
}

const MobileNav: React.FC<MobileNavProps> = ({ toggleMobileHome, setToggleMobileHome }) => {
    return (
        <div className="flex space-x-2 mb-4">
            <button
                onClick={() => setToggleMobileHome("inbox")}
                className={`px-4 py-2 rounded-md font-medium transition ${toggleMobileHome === "inbox"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            >
                Inbox
            </button>

            <button
                onClick={() => setToggleMobileHome("online")}
                className={`px-4 py-2 rounded-md font-medium transition ${toggleMobileHome === "online"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
            >
                Online
            </button>
        </div>
    );
};

export default MobileNav;
