using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Common.Interfaces;

public interface IConversationRepository
{
    Task<Guid> GetOrCreatePrivateConversationAsync(Guid userA, Guid userB);
    Task<IEnumerable<Conversation>> GetUserConversationsAsync(Guid userId);
}