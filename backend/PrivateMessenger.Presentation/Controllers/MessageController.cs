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

        // 1. Broadcast to active chat room
        await _hub.Clients.Group(request.ConversationId.ToString().ToLower())
            .SendAsync("ReceiveMessage", message);

        // 2. Chat list update payload
        var updatePayload = new
        {
            conversationId = request.ConversationId,
            lastMessage = request.Content,
            senderId = request.SenderId,
            updatedAt = DateTime.UtcNow
        };

        // 3. TARGETED ALERT NOTIFICATION PAYLOAD (For App.tsx)
        var notificationPayload = new
        {
            conversationId = request.ConversationId,
            senderId = request.SenderId,
            receiverId = request.ReceiverId,
            content = request.Content
        };

        // 4. Convert GUIDs to lowercase to target user personal groups
        string receiverGroup = $"user_{request.ReceiverId.ToString().ToLower()}";
        string senderGroup = $"user_{request.SenderId.ToString().ToLower()}";

        // A. Update ChatLists for both users
        await _hub.Clients.Group(receiverGroup).SendAsync("ConversationUpdated", updatePayload);
        await _hub.Clients.Group(senderGroup).SendAsync("ConversationUpdated", updatePayload);

        // B. Send targeted alert notification ONLY to Sender and Receiver personal groups
        await _hub.Clients.Group(receiverGroup).SendAsync("ReceiveNotification", notificationPayload);
        await _hub.Clients.Group(senderGroup).SendAsync("ReceiveNotification", notificationPayload);

        return Ok(message);
    }
}

public record SendMessageRequest(
    Guid ConversationId,
    Guid SenderId,
    Guid ReceiverId,
    string Content
);