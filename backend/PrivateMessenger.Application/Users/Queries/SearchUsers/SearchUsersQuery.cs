using MediatR;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Users.Queries.SearchUsers;

public record SearchUsersQuery(string? Search, Guid CurrentUserId) : IRequest<IEnumerable<User>>;