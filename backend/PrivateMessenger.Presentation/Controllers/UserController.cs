using MediatR;
using Microsoft.AspNetCore.Mvc;
using PrivateMessenger.Application.Users.Queries.SearchUsers;

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
}