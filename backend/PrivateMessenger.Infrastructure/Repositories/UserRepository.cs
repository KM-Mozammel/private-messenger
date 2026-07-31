using System.Data;
using Dapper;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User> GetOrCreateUserAsync(string username)
    {
        using var connection = _connectionFactory.CreateConnection();

        var user = await connection.QuerySingleOrDefaultAsync<User>(
            "SELECT * FROM Users WHERE Username = @Username",
            new { Username = username });

        if (user != null)
            return user;

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Username = username,
            CreatedAt = DateTime.UtcNow
        };

        await connection.ExecuteAsync(
            @"INSERT INTO Users (Id, Username, CreatedAt)
              VALUES (@Id, @Username, @CreatedAt)",
            newUser);

        return newUser;
    }

    public async Task<IEnumerable<User>> SearchUsersAsync(string? search, Guid currentUserId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT * FROM Users
            WHERE Username LIKE '%' + @Search + '%' 
            AND Id != @CurrentUserId
        ";

        return await connection.QueryAsync<User>(
            sql,
            new { Search = search ?? string.Empty, CurrentUserId = currentUserId });
    }
}