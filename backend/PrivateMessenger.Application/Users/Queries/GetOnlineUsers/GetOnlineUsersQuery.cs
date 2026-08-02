using MediatR;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Users.Queries.GetOnlineUsers
{
    public record GetOnlineUsersQuery(IEnumerable<Guid> UserIds) : IRequest<IEnumerable<User>>;
}
