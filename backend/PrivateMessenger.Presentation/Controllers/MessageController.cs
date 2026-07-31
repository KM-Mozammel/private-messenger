using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using PrivateMessenger.Application.Messages.Commands.SendMessage;
using PrivateMessenger.Application.Messages.Queries.GetMessagesByConversation;
using PrivateMessengerBackend.Hubs;

namespace PrivateMessenger.Presentation.Controllers;

[ApiController]
[Route("api/messages")]
public class MessageController : ControllerBase
{
    private readonly ISender _mediator;
    private readonly IHubContext<ChatHub> _hub;

    public MessageController(ISender mediator, IHubContext<ChatHub> hub)
    {
        _mediator = mediator;
        _hub = hub;
    }

    [HttpGet("{conversationId:guid}")]
    public async Task<IActionResult> GetMessages(Guid conversationId)
    {
        var query = new GetMessagesByConversationQuery(conversationId);
        var messages = await _mediator.Send(query);
        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage([FromBody] SendMessageRequest request)
    {
        var command = new SendMessageCommand(request.ConversationId, request.SenderId, request.Content);
        var message = await _mediator.Send(command);

        await _hub.Clients.Group(request.ConversationId.ToString()).SendAsync("ReceiveMessage", message);

        var updatePayload = new
        {
            conversationId = request.ConversationId,
            lastMessage = request.Content,
            senderId = request.SenderId,
            updatedAt = DateTime.UtcNow
        };

        await _hub.Clients.User(request.ReceiverId.ToString()).SendAsync("ConversationUpdated", updatePayload);
        await _hub.Clients.User(request.SenderId.ToString()).SendAsync("ConversationUpdated", updatePayload);

        return Ok(message);
    }
}

public record SendMessageRequest(
    Guid ConversationId,
    Guid SenderId,
    Guid ReceiverId,
    string Content
);