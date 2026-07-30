import React from "react";
import { useCall } from "../../context/CallContext";

export default function IncomingCallModal() {
  const { callState, callType, remoteUserId, endCall } = useCall();

  // Show modal only when ringing
  if (callState !== "ringing") return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center">
        <p className="text-lg font-semibold mb-2">
          {callType === "video" ? "📹 Video Call" : "📞 Audio Call"}
        </p>
        <p className="text-sm mb-4">Incoming call from: {remoteUserId}</p>

        <div className="flex justify-around gap-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={() => alert("Accept clicked — next step")}
          >
            Accept
          </button>
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={endCall}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
