using System.Data;
using Dapper;
using PrivateMessengerBackend.Models;

namespace PrivateMessengerBackend.Data
{
    public class MessageRepository
    {
        private readonly IDbConnection _db;

        public MessageRepository(IDbConnection db)
        {
            _db = db;
        }

        // 🔹 Get all messages for a conversation
        public async Task<IEnumerable<Message>> GetMessagesByConversationId(Guid conversationId)
        {
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

            return await _db.QueryAsync<Message>(sql, new
            {
                ConversationId = conversationId
            });
        }

        // 🔹 Create a new message
        public async Task<Message> CreateMessage(
            Guid conversationId,
            Guid senderId,
            string content)
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

            await _db.ExecuteAsync(sql, message);
            return message;
        }
    }
}
