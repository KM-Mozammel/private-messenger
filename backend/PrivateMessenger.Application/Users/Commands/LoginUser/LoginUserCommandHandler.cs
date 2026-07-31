using MediatR;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Users.Commands.LoginUser;

public class LoginUserCommandHandler : IRequestHandler<LoginUserCommand, User>
{
    private readonly IUserRepository _userRepository;

    public LoginUserCommandHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<User> Handle(LoginUserCommand request, CancellationToken cancellationToken)
    {
        return await _userRepository.GetOrCreateUserAsync(request.Username);
    }
}