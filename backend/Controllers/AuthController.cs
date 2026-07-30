using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserRepository _userRepository;

    public AuthController(UserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login ([FromBody] LoginRequest request)
    {
        if(string.IsNullOrWhiteSpace(request.Username))
            return BadRequest("Username is required");

        var user = await _userRepository.GetOrCreateUser(request.Username);

        return Ok(new
        {
            user.Id,
            user.Username
        });
    }
}