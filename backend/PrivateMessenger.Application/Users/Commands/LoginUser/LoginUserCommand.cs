using MediatR;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Users.Commands.LoginUser;

public record LoginUserCommand(string Username) : IRequest<User>;