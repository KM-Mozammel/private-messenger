using PrivateMessenger.Application;
using PrivateMessenger.Infrastructure;
using PrivateMessengerBackend.Hubs;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.File(
        path: "logs/app.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 1,
        fileSizeLimitBytes: 10_000_000,
        rollOnFileSizeLimit: true
    )
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddSignalR();

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins(
            "http://localhost:5173",
            "https://mk-private-messenger.vercel.app",
            "http://192.168.0.195:5173",
            "https://192.168.0.195:5173"
        )
        .SetIsOriginAllowed(_ => true)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

builder.WebHost.UseUrls(
    "http://0.0.0.0:5041",
    "https://0.0.0.0:7024"
);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRouting();
app.UseCors("AllowReact");

//app.UseHttpsRedirection();
//app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<ChatHub>("hubs/chat");
app.Run();
