using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PrivateMessenger.Application.Common.Interfaces;
using PrivateMessenger.Infrastructure.Data;
using PrivateMessenger.Infrastructure.Repositories;

namespace PrivateMessenger.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<IDbConnectionFactory, DbConnectionFactory>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IConversationRepository, ConversationRepository>();
        return services;
    }
}