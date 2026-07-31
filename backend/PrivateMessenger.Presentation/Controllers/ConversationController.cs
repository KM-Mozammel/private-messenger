using MediatR;
using Microsoft.AspNetCore.Mvc;
using PrivateMessenger.Application.Conversations.Commands.StartPrivateChat;
using PrivateMessenger.Application.Conversations.Queries.GetUserConversations;

namespace PrivateMessenger.Presentation.Controllers;

[ApiController]
[Route("api/conversations")]
public class ConversationController : ControllerBase
{
    private readonly ISender _mediator;

    public ConversationController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("start")]
    public async Task<IActionResult> StartChat([FromBody] StartChatRequest request)
    {
        var command = new StartPrivateChatCommand(request.CurrentUserId, request.TargetUserId);
        var conversationId = await _mediator.Send(command);

        return Ok(new { conversationId });
    }

    [HttpGet]
    public async Task<IActionResult> GetUserConversations([FromQuery] Guid userId)
    {
        var query = new GetUserConversationsQuery(userId);
        var chats = await _mediator.Send(query);

        return Ok(chats);
    }
}

public record StartChatRequest(Guid CurrentUserId, Guid TargetUserId);