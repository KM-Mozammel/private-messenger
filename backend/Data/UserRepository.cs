using System.Data;
using Dapper;
using PrivateMessengerBackend.Models;

public class UserRepository
{
    private readonly IDbConnection _db;
    public UserRepository(IDbConnection db)
    {
        _db = db;
    }

    public async Task<User> GetOrCreateUser(string username)
    {
        var user = await _db.QuerySingleOrDefaultAsync<User>(
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

        await _db.ExecuteAsync(
            @"INSERT INTO Users (Id, Username, CreatedAt)
              VALUES (@Id, @Username, @CreatedAt)",
            newUser);

        return newUser;
    }

    public async Task<IEnumerable<User>> SearchUsersAsync(string? search, Guid currentUserId)
    {
        var sql = @"
            SELECT * FROM Users
            WHERE Username LIKE '%' + @Search + '%' 
            AND Id != @CurrentUserId
        ";

        return await _db.QueryAsync<User>(sql, new { Search = search ?? string.Empty, CurrentUserId = currentUserId });
    }
}