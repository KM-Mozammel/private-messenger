import { useState, useRef } from "react";
import type { ChatHeaderProps } from "../../types/models";
import { MdAddCall } from "react-icons/md";
import { MdOutlineVideoCall } from "react-icons/md";

export default function ChatHeader({ onBack, activeChat }: ChatHeaderProps) {
  if (!activeChat) return null;
  const startCall = (type: "audio" | "video") => {
    alert(`Starting ${type} call with ${activeChat.user.username}`);
  }
  return (
    <div className="
      sticky top-0 bg-[var(--bg-surface)]/90 z-10
      flex items-center justify-between gap-3
      p-3
      border-b border-[var(--border)]
    ">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="text-xl cursor-pointer md:hidden"
        >
          ←
        </button>

        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
          {activeChat.user.username
            ? activeChat.user.username.charAt(0).toUpperCase()
            : "?"}
        </div>

        <div>
          <div className="font-semibold">{activeChat.user.username}</div>
          <div className="text-xs text-[var(--text-secondary)]">Online</div>
        </div>
      </div>

      <div className="flex flex-row gap-5 items-center">
        <MdAddCall
          className="text-2xl cursor-pointer hover:text-green-500"
          onClick={() => startCall("audio")}
        />
        <MdOutlineVideoCall
          className="text-2xl cursor-pointer hover:text-blue-500"
          onClick={() => startCall("video")}
        />
      </div>
    </div>
  );
}
