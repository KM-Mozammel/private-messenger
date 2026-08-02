using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace PrivateMessengerBackend.Hubs
{
    public class ChatHub : Hub
    {
        // 🔹 Use ConcurrentDictionary for thread-safe operations without manual locking
        // Maps UserId -> List of Active ConnectionIDs
        private static readonly ConcurrentDictionary<Guid, HashSet<string>> OnlineUsers = new();

        // Maps ConversationId -> List of Active ConnectionIDs
        private static readonly ConcurrentDictionary<Guid, HashSet<string>> GroupUsers = new();

        public override async Task OnConnectedAsync()
        {
            var httpContext = Context.GetHttpContext();
            var userIdStr = httpContext?.Request.Query["userId"].ToString();
            var usernameStr = httpContext?.Request.Query["username"].ToString();

            if (Guid.TryParse(userIdStr, out var userGuid))
            {
                var isFirstConnection = false;

                // Add connection ID to user's list of active connections
                OnlineUsers.AddOrUpdate(
                    userGuid,
                    // If user is coming online for the first time
                    _ =>
                    {
                        isFirstConnection = true;
                        return new HashSet<string> { Context.ConnectionId };
                    },
                    // If user already has other active tabs/devices open
                    (_, connections) =>
                    {
                        lock (connections)
                        {
                            connections.Add(Context.ConnectionId);
                        }
                        return connections;
                    }
                );

                // 🔹 Only broadcast "UserOnline" if this is their FIRST active connection
                if (isFirstConnection)
                {
                    await Clients.Others.SendAsync("UserOnline", userGuid.ToString(), usernameStr ?? "User");
                }
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            Guid disconnectedUserId = Guid.Empty;
            var isFullyDisconnected = false;

            // 1. Remove connection ID from OnlineUsers
            foreach (var (userId, connections) in OnlineUsers)
            {
                bool containsConnection;
                lock (connections)
                {
                    containsConnection = connections.Remove(Context.ConnectionId);
                    if (containsConnection && connections.Count == 0)
                    {
                        isFullyDisconnected = true;
                    }
                }

                if (containsConnection)
                {
                    disconnectedUserId = userId;
                    if (isFullyDisconnected)
                    {
                        OnlineUsers.TryRemove(userId, out _);
                    }
                    break;
                }
            }

            // 🔹 Only broadcast "UserOffline" if ALL tabs/devices for this user disconnected
            if (disconnectedUserId != Guid.Empty && isFullyDisconnected)
            {
                await Clients.All.SendAsync("UserOffline", disconnectedUserId.ToString());
            }

            // 2. Cleanup Group connections
            foreach (var (groupId, connections) in GroupUsers)
            {
                lock (connections)
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0)
                    {
                        GroupUsers.TryRemove(groupId, out _);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        /*---------------------GROUPS---------------------*/
        public async Task JoinConversation(Guid conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());

            GroupUsers.AddOrUpdate(
                conversationId,
                _ => new HashSet<string> { Context.ConnectionId },
                (_, connections) =>
                {
                    lock (connections)
                    {
                        connections.Add(Context.ConnectionId);
                    }
                    return connections;
                }
            );
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());

            if (GroupUsers.TryGetValue(conversationId, out var connections))
            {
                lock (connections)
                {
                    connections.Remove(Context.ConnectionId);
                    if (connections.Count == 0)
                    {
                        GroupUsers.TryRemove(conversationId, out _);
                    }
                }
            }
        }

        /*---------------------Messaging---------------------*/
        public async Task BrodcastMessage(Guid conversationId, object message)
        {
            await Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", message);
        }

        /*---------------------NOTIFICATIONS---------------------*/
        public async Task NotifyNewConversation(Guid receiverUserId, object conversationPayload)
        {
            if (OnlineUsers.TryGetValue(receiverUserId, out var connections))
            {
                List<string> targetConnectionIds;
                lock (connections)
                {
                    targetConnectionIds = connections.ToList();
                }

                // Send to ALL active devices/tabs of the receiver
                await Clients.Clients(targetConnectionIds).SendAsync("ConversationStarted", conversationPayload);
            }
        }

        /*---------------------GETTERS---------------------*/
        public static IReadOnlyCollection<Guid> GetOnlineUsers()
        {
            return OnlineUsers.Keys.ToList().AsReadOnly();
        }

        public static IReadOnlyDictionary<Guid, List<string>> GetGroupUsers()
        {
            return GroupUsers.ToDictionary(
                kvp => kvp.Key,
                kvp =>
                {
                    lock (kvp.Value)
                    {
                        return kvp.Value.ToList();
                    }
                }
            );
        }

        public static List<string> GetConnectionIdsByUserId(Guid userId)
        {
            if (OnlineUsers.TryGetValue(userId, out var connections))
            {
                lock (connections)
                {
                    return connections.ToList();
                }
            }
            return new List<string>();
        }
    }
}