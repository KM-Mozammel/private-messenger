using MediatR;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Conversations.Queries.GetUserConversations;

public class GetUserConversationsQueryHandler : IRequestHandler<GetUserConversationsQuery, IEnumerable<Conversation>>
{
    private readonly IConversationRepository _conversationRepository;

    public GetUserConversationsQueryHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<IEnumerable<Conversation>> Handle(GetUserConversationsQuery request, CancellationToken cancellationToken)
    {
        return await _conversationRepository.GetUserConversationsAsync(request.UserId);
    }
}