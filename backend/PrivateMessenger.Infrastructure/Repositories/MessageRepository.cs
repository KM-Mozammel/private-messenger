using System.Data;
using Dapper;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Infrastructure.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public MessageRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // 🔹 Get all messages for a conversation
    public async Task<IEnumerable<Message>> GetMessagesByConversationIdAsync(Guid conversationId)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = """
            SELECT 
                Id,
                ConversationId,
                SenderId,
                Content,
                CreatedAt
            FROM Messages
            WHERE ConversationId = @ConversationId
            ORDER BY CreatedAt ASC
        """;

        return await connection.QueryAsync<Message>(sql, new { ConversationId = conversationId });
    }

    // 🔹 Create a new message
    public async Task<Message> CreateMessageAsync(Guid conversationId, Guid senderId, string content)
    {
        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = conversationId,
            SenderId = senderId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        const string sql = """
            INSERT INTO Messages (
                Id,
                ConversationId,
                SenderId,
                Content,
                CreatedAt
            )
            VALUES (
                @Id,
                @ConversationId,
                @SenderId,
                @Content,
                @CreatedAt
            )
        """;

        using var connection = _connectionFactory.CreateConnection();
        await connection.ExecuteAsync(sql, message);

        return message;
    }
}