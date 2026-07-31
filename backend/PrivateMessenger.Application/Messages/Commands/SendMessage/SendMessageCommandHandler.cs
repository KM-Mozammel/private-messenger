using MediatR;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Messages.Commands.SendMessage;

public class SendMessageCommandHandler : IRequestHandler<SendMessageCommand, Message>
{
    private readonly IMessageRepository _messageRepository;

    public SendMessageCommandHandler(IMessageRepository messageRepository)
    {
        _messageRepository = messageRepository;
    }

    public async Task<Message> Handle(SendMessageCommand request, CancellationToken cancellationToken)
    {
        return await _messageRepository.CreateMessageAsync(
            request.ConversationId,
            request.SenderId,
            request.Content
        );
    }
}