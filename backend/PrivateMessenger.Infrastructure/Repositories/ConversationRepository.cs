using System.Data;
using Dapper;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Infrastructure.Repositories;

public class ConversationRepository : IConversationRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public ConversationRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<Guid> GetOrCreatePrivateConversationAsync(Guid userA, Guid userB)
    {
        using var connection = _connectionFactory.CreateConnection();

        var conversationId = await connection.QuerySingleOrDefaultAsync<Guid?>(@"
            SELECT cp1.ConversationId
            FROM ConversationParticipants cp1
            JOIN ConversationParticipants cp2 
                ON cp1.ConversationId = cp2.ConversationId
            JOIN Conversations c ON c.Id = cp1.ConversationId
            WHERE c.IsGroup = 0
            AND cp1.UserId = @UserA
            AND cp2.UserId = @UserB
        ", new { UserA = userA, UserB = userB });

        if (conversationId != null)
            return conversationId.Value;

        var newConversationId = Guid.NewGuid();

        await connection.ExecuteAsync(@"
            INSERT INTO Conversations (Id, IsGroup, CreatedAt)
            VALUES (@Id, 0, @CreatedAt);

            INSERT INTO ConversationParticipants (ConversationId, UserId)
            VALUES (@Id, @UserA),
                   (@Id, @UserB);
        ", new
        {
            Id = newConversationId,
            UserA = userA,
            UserB = userB,
            CreatedAt = DateTime.UtcNow
        });

        return newConversationId;
    }

    public async Task<IEnumerable<Conversation>> GetUserConversationsAsync(Guid userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        const string sql = @"
            SELECT 
                c.Id AS ConversationId,
                u.Id AS UserId,
                u.Username,
                m.Content AS LastMessage,
                m.CreatedAt AS LastMessageAt
            FROM Conversations c
            JOIN ConversationParticipants cp1 ON cp1.ConversationId = c.Id
            JOIN ConversationParticipants cp2 ON cp2.ConversationId = c.Id AND cp2.UserId != @UserId
            JOIN Users u ON u.Id = cp2.UserId
            OUTER APPLY (
                SELECT TOP 1 Content, CreatedAt
                FROM Messages
                WHERE ConversationId = c.Id
                ORDER BY CreatedAt DESC
            ) m
            WHERE cp1.UserId = @UserId
              AND c.IsGroup = 0
            ORDER BY m.CreatedAt DESC
        ";

        return await connection.QueryAsync<Conversation>(sql, new { UserId = userId });
    }
}