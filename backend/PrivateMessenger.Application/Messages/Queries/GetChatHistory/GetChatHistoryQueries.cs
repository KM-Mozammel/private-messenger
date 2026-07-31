// PrivateMessenger.Application/Messages/Queries/GetChatHistory/GetChatHistoryQuery.cs
using MediatR;

namespace PrivateMessenger.Application.Messages.Queries.GetChatHistory;

public record ChatMessageDto(Guid Id, string SenderId, string Content, DateTime SentAt);
public record GetChatHistoryQuery(string UserId, string ContactId) : IRequest<List<ChatMessageDto>>;