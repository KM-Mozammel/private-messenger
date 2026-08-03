using MediatR;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Users.Queries.GetOnlineUsers
{
    public class GetOnlineUsersQueryHandler : IRequestHandler<GetOnlineUsersQuery, IEnumerable<User>>
    {
        private readonly IUserRepository _userRepository;

        public GetOnlineUsersQueryHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<IEnumerable<User>> Handle(GetOnlineUsersQuery request, CancellationToken cancellationToken)
        {
            var users = await _userRepository.GetUsersByIdsAsync(request.UserIds);
            return users;
        }
    }
}
