using System.Data;
using Dapper;
using PrivateMessengerBackend.Dtos;

namespace PrivateMessengerBackend.Data
{
    public class ConversationRepository
    {
        private readonly IDbConnection _db;
        public ConversationRepository(IDbConnection db)
        {
            _db = db;
        }
        public async Task<Guid> GetOrCreatePrivateConversation(Guid userA, Guid userB)
        {
            var conversationId = await _db.QuerySingleOrDefaultAsync<Guid?>(@"
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

            await _db.ExecuteAsync(@"
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

        public async Task<IEnumerable<ConversationDto>> GetUserConversations(Guid userId)
        {
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

            return await _db.QueryAsync<ConversationDto>(sql, new { UserId = userId });
        }
    }
}