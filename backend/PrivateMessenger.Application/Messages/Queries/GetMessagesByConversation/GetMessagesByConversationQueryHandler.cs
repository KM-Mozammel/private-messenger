using MediatR;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Messages.Queries.GetMessagesByConversation;

public class GetMessagesByConversationQueryHandler
    : IRequestHandler<GetMessagesByConversationQuery, IEnumerable<Message>>
{
    private readonly IMessageRepository _messageRepository;

    public GetMessagesByConversationQueryHandler(IMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    public async Task<IEnumerable<Message>> Handle(
        GetMessagesByConversationQuery request,
        CancellationToken cancellationToken)
    {
        return await _messageRepository.GetMessagesByConversationIdAsync(request.ConversationId);
    }
}