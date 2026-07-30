using Microsoft.AspNetCore.Mvc;

namespace PrivateMessengerBackend.Controllers
{
    [ApiController]
    [Route("api/users")]
    public class UserController : ControllerBase
    {
        private readonly UserRepository _userRepository;
        public UserController(UserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchUsers([FromQuery] string query, [FromQuery] Guid currentUserId)
        {
            var users = await _userRepository.SearchUsersAsync(query, currentUserId);
            return Ok(users);
        }
    }
}
