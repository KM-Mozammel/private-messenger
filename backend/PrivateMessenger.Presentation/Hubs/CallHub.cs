using Microsoft.AspNetCore.SignalR;

namespace PrivateMessengerBackend.Hubs
{
    public class CallHub : Hub
    {
        public async Task StartCall (string toUserId, string callType)
        {
            await Clients.User(toUserId).SendAsync("IncomingCall", Context.UserIdentifier, callType);
        }

        public async Task SendOffer(string toUserId, object offer)
        {
            await Clients.User(toUserId)
                .SendAsync("ReceiveOffer", Context.UserIdentifier, offer);
        }

        public async Task SendAnswer(string toUserId, object answer)
        {
            await Clients.User(toUserId)
                .SendAsync("ReceiveAnswer", answer);
        }

        public async Task SendIceCandidate(string toUserId, object candidate)
        {
            await Clients.User(toUserId)
                .SendAsync("ReceiveIceCandidate", candidate);
        }
    }
}
