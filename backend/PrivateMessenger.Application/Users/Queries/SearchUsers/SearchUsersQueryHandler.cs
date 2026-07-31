using MediatR;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Domain.Entities;

namespace PrivateMessenger.Application.Users.Queries.SearchUsers;

public class SearchUsersQueryHandler : IRequestHandler<SearchUsersQuery, IEnumerable<User>>
{
    private readonly IUserRepository _userRepository;

    public SearchUsersQueryHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<User>> Handle(SearchUsersQuery request, CancellationToken cancellationToken)
    {
        return await _userRepository.SearchUsersAsync(request.Search, request.CurrentUserId);
    }
}