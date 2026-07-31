using MediatR;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Messages.Commands.SendMessage;

public record SendMessageCommand(
    Guid ConversationId,
    Guid SenderId,
    string Content
) : IRequest<Message>;