using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User> GetOrCreateUserAsync(string username);
    Task<IEnumerable<User>> SearchUsersAsync(string? search, Guid currentUserId);
}