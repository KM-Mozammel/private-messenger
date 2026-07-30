using Microsoft.AspNetCore.Mvc;
using PrivateMessengerBackend.Hubs;

namespace PrivateMessengerBackend.Controllers
{
    [ApiController]
    [Route("api/presence")]
    public class PresenceController : Controller
    {
        [HttpGet("online-users")]
        public IActionResult GetOnlineUsers()
        {
            return Ok(ChatHub.GetOnlineUsers());
        }
    }
}
