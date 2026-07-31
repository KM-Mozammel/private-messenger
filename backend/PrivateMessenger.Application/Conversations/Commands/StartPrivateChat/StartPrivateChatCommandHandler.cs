using MediatR;
using PrivateMessenger.Application.Common.Interfaces;

namespace PrivateMessenger.Application.Conversations.Commands.StartPrivateChat;

public class StartPrivateChatCommandHandler : IRequestHandler<StartPrivateChatCommand, Guid>
{
    private readonly IConversationRepository _conversationRepository;

    public StartPrivateChatCommandHandler(IConversationRepository conversationRepository)
    {
        _conversationRepository = conversationRepository;
    }

    public async Task<Guid> Handle(StartPrivateChatCommand request, CancellationToken cancellationToken)
    {
        return await _conversationRepository.GetOrCreatePrivateConversationAsync(
            request.CurrentUserId,
            request.TargetUserId
        );
    }
}