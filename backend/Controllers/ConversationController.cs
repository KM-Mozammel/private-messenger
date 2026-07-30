using Microsoft.AspNetCore.Mvc;
using PrivateMessengerBackend.Data;

namespace PrivateMessengerBackend.Controllers
{
    [ApiController]
    [Route("api/conversations")]
    public class ConversationController : ControllerBase
    {
        private readonly ConversationRepository _conversationRepository;
        public ConversationController(ConversationRepository conversationRepository)
        {
            _conversationRepository = conversationRepository;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartChat(Guid currentUserId, Guid targetUserId)
        {
            var conversationId = await _conversationRepository.GetOrCreatePrivateConversation(currentUserId, targetUserId);
            return Ok(new {conversationId});
        }

        [HttpGet]
        public async Task<IActionResult> GetUserConversations(Guid userId)
        {
            var chats = await _conversationRepository.GetUserConversations(userId);
            return Ok(chats);
        }

    }
}
