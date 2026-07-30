using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PrivateMessengerBackend.Data;
using PrivateMessengerBackend.Hubs;

namespace PrivateMessengerBackend.Controllers
{
    [ApiController]
    [Route("api/messages")]
    public class MessageController : ControllerBase
    {
        private readonly MessageRepository _messageRepository;
        private readonly IHubContext<ChatHub> _hub;

        public MessageController(MessageRepository messageRepository, IHubContext<ChatHub> hub)
        {
            _messageRepository = messageRepository;
            _hub = hub;
        }

        [HttpGet("{conversationId}")]
        public async Task<IActionResult> GetMessages(Guid conversationId)
        {
            var messages = await _messageRepository.GetMessagesByConversationId(conversationId);
            return Ok(messages);
        }

        public record SendMessageRequest(
            Guid ConversationId,
            Guid SenderId,
            string Content
        );

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
        {
            var message = await _messageRepository.CreateMessage(request.ConversationId, request.SenderId, request.Content);
            await _hub.Clients.Group(request.ConversationId.ToString()).SendAsync("ReceiveMessage", message);
            return Ok(message);
        }
    }
}
