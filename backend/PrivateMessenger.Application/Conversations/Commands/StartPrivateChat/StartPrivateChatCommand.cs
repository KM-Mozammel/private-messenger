using MediatR;

namespace PrivateMessenger.Application.Conversations.Commands.StartPrivateChat;
public record StartPrivateChatCommand(Guid CurrentUserId, Guid TargetUserId) : IRequest<Guid>;