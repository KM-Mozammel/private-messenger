import type { UserGreetingProps } from "../../types/models";

export default function UserGreeting({ username }: UserGreetingProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Avatar circle with initials */}
        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-var font-bold">
          {username ? username.charAt(0).toUpperCase() : "?"}
        </div>

        {/* Greeting text */}
        <div className="flex flex-col leading-tight">
          <span className="font-semibold text-lg">
            Hi, {username || "User"}
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm">
            Welcome back!
          </span>
        </div>
      </div>
    </div>
  );
}
