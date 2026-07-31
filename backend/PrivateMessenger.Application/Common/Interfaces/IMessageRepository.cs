
using PrivateMessenger.Domain.Entities;
namespace PrivateMessenger.Application.Common.Interfaces;

public interface IMessageRepository
{
    Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(Guid conversationId);
    Task<Message> CreateMessageAsync(Guid conversationId, Guid senderId, string content);
}