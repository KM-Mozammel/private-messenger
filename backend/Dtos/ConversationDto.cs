namespace PrivateMessengerBackend.Dtos
{
    public class ConversationDto
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string LastMessage { get; set; }
        public DateTime? LastMessageAt { get; set; }
    }

}
