using MediatR;
using Microsoft.AspNetCore.Mvc;
using PrivateMessenger.Application.Users.Queries.GetOnlineUsers;
using PrivateMessenger.Application.Users.Queries.SearchUsers;
using PrivateMessengerBackend.Hubs;

namespace PrivateMessenger.Presentation.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly ISender _mediator;

    public UserController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string? query, [FromQuery] Guid currentUserId)
    {
        var searchQuery = new SearchUsersQuery(query, currentUserId);
        var users = await _mediator.Send(searchQuery);

        return Ok(users);
    }

    [HttpGet("online")]
    public async Task<IActionResult> GetOnlineUsers()
    {
        // Get online user IDs from your Hub/Tracker
        var onlineUserIds = ChatHub.GetOnlineUsers();

        // Pass IDs into the query
        var query = new GetOnlineUsersQuery(onlineUserIds);
        var onlineUsers = await _mediator.Send(query);

        return Ok(onlineUsers);
    }

}