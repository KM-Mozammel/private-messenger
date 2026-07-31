using MediatR;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Messages.Queries.GetMessagesByConversation;

public record GetMessagesByConversationQuery(Guid ConversationId) : IRequest<IEnumerable<Message>>;