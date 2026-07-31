using MediatR;
using Microsoft.AspNetCore.Mvc;
using PrivateMessenger.Application.Users.Commands.LoginUser;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly ISender _mediator;

    public AuthController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login ([FromBody] PrivateMessenger.Application.DTOs.LoginRequest request)
    {
        if(string.IsNullOrWhiteSpace(request.Username))
            return BadRequest("Username is required");

        var command = new LoginUserCommand(request.Username);
        var user = await _mediator.Send(command);

        return Ok(new
        {
            user.Id,
            user.Username
        });
    }
}