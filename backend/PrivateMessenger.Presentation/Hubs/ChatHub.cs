using Microsoft.AspNetCore.SignalR;

namespace PrivateMessengerBackend.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly Dictionary<Guid, string> OnlineUsers = new();
        private static readonly Dictionary<Guid, List<string>> GroupUsers = new();

        public override async Task OnConnectedAsync()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];

            if (!string.IsNullOrEmpty(userId))
            {
                OnlineUsers[Guid.Parse(userId!)] = Context.ConnectionId;
                await Clients.All.SendAsync("UserOnline", userId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = OnlineUsers.FirstOrDefault(x => x.Value == Context.ConnectionId);

            if (user.Key != Guid.Empty)
            {
                OnlineUsers.Remove(user.Key);
                await Clients.All.SendAsync("UserOffline", user.Key);
            }

            // গ্রুপ থেকেও রিমুভ করো
            foreach (var group in GroupUsers.Keys.ToList())
            {
                if (GroupUsers[group].Contains(Context.ConnectionId))
                {
                    GroupUsers[group].Remove(Context.ConnectionId);

                    if (GroupUsers[group].Count == 0)
                    {
                        GroupUsers.Remove(group);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        /*---------------------GROUPS---------------------*/
        public async Task JoinConversation(Guid conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());

            if (!GroupUsers.ContainsKey(conversationId))
            {
                GroupUsers[conversationId] = new List<string>();
            }

            if (!GroupUsers[conversationId].Contains(Context.ConnectionId))
            {
                GroupUsers[conversationId].Add(Context.ConnectionId);
            }
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());

            if (GroupUsers.ContainsKey(conversationId))
            {
                GroupUsers[conversationId].Remove(Context.ConnectionId);

                if (GroupUsers[conversationId].Count == 0)
                {
                    GroupUsers.Remove(conversationId);
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
            if (OnlineUsers.TryGetValue(receiverUserId, out var connectionId))
            {
                await Clients.Client(connectionId).SendAsync("ConversationStarted", conversationPayload);
            }
        }

        /*---------------------GETTERS---------------------*/
        public static IReadOnlyCollection<Guid> GetOnlineUsers() => OnlineUsers.Keys;
        public static IReadOnlyDictionary<Guid, List<string>> GetGroupUsers() => GroupUsers;
        public static string? GetConnectionIdByUserId(Guid userId)
        {
            OnlineUsers.TryGetValue(userId, out var connectionId);
            return connectionId;
        }
    }
}
