using MediatR;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Conversations.Queries.GetUserConversations;

public record GetUserConversationsQuery(Guid UserId) : IRequest<IEnumerable<Conversation>>;