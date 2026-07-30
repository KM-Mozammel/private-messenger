import { createContext, useContext, useState, ReactNode } from "react";
import { CallType, CallState } from "../types/callTypes";
import * as signalR from "@microsoft/signalr";
import { getConnection } from "../services/signalR";

interface CallContextType {
    callState: CallState;
    callType: CallType | null;
    remoteUserId: string | null;
    startCall: (type: CallType, userId: string) => void;
    receiveCall: (type: CallType, userId: string) => void;
    endCall: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider = ({ children }: { children: ReactNode }) => {
    const [callState, setCallState] = useState<CallState>("idle");
    const [callType, setCallType] = useState<CallType | null>(null);
    const [remoteUserId, setRemoteUserId] = useState<string | null>(null);

    const startCall = (type: CallType, userId: string) => {
        setCallType(type);
        setRemoteUserId(userId);
        setCallState("calling");
    }

    const receiveCall = (type: CallType, userId: string) => {
        setCallType(type);
        setRemoteUserId(userId);
        setCallState("ringing");
    }

    const endCall = () => {
        setCallState("ended");
        setCallType(null);
        setRemoteUserId(null);

        setTimeout(() => {setCallState("idle")}, 300);
    }

    return (
        <CallContext.Provider value={{
            callState,
            callType,
            remoteUserId,
            startCall,
            receiveCall,
            endCall
        }}>
            {children}
        </CallContext.Provider>
    );
};

export const useCall = () => {
    const ctx = useContext(CallContext);
    if (!ctx) {
        throw new Error("useCall must be used within a CallProvider");
    }
    return ctx;
}