using System;
using System.Collections.Generic;
using System.Text;

namespace PrivateMessenger.Domain.Entities
{
    public class Conversation
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string LastMessage { get; set; }
        public DateTime? LastMessageAt { get; set; }
    }
}
