using Microsoft.AspNetCore.SignalR;

namespace PrivateMessengerBackend.Hubs
{
    public class ChatHub : Hub
    {
        private static readonly Dictionary<Guid, string> OnlineUsers = new();

        public override async Task OnConnectedAsync ()
        {
            var userId = Context.GetHttpContext()?.Request.Query["userId"];

            if(!string.IsNullOrEmpty(userId)) {
                OnlineUsers[Guid.Parse(userId!)] = Context.ConnectionId;

                await Clients.All.SendAsync("UserOnline", userId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var user = OnlineUsers.FirstOrDefault(x => x.Value == Context.ConnectionId);

            if(user.Key != Guid.Empty)
            {
                OnlineUsers.Remove(user.Key);
                await Clients.All.SendAsync("UserOffline", user.Key);
            }

            await base.OnDisconnectedAsync(exception);
        }

        /*---------------------GROUPS---------------------*/
        public async Task JoinConversation(Guid conversationId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, conversationId.ToString());
        }

        public async Task LeaveConversation(Guid conversationId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId.ToString());
        }
        /*---------------------Messaging---------------------*/
        public async Task BrodcastMessage(Guid conversationId, object message)
        {
            await Clients.Group(conversationId.ToString()).SendAsync("ReceiveMessage", message);
        }

        /*---------------------GETTERS---------------------*/
        public static IReadOnlyCollection<Guid> GetOnlineUsers() => OnlineUsers.Keys;
    }
}
