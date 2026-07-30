using System.Data;
using Microsoft.Data.SqlClient;
using PrivateMessengerBackend.Data;
using PrivateMessengerBackend.Hubs;

var builder = WebApplication.CreateBuilder(args);

/* ---------------------------
   Configuration / URLs
   --------------------------- */
builder.WebHost.UseUrls("http://0.0.0.0:5000");

/* ---------------------------
   Services (DI)
   --------------------------- */
builder.Services.AddControllers();
builder.Services.AddSignalR();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

/* Database connection (scoped per request) */
builder.Services.AddScoped<IDbConnection>(sp => new SqlConnection(builder.Configuration.GetConnectionString("DefaultConnection")));
/* Alternative remote connection (kept for reference) */
//builder.Services.AddScoped<IDbConnection>(sp => new SqlConnection(builder.Configuration.GetConnectionString("RemoteConnection")));

/* Repositories */
builder.Services.AddScoped<UserRepository>();
builder.Services.AddScoped<ConversationRepository>();
builder.Services.AddScoped<MessageRepository>();

/* ---------------------------
   CORS
   --------------------------- */
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://192.168.0.200:5173", "https://mk-private-messenger.vercel.app", "http://192.168.0.198:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

/* ---------------------------
   Middleware pipeline
   --------------------------- */
//API documentation
app.UseSwagger();
app.UseSwaggerUI();

//if (app.Environment.IsDevelopment())
//{
//    app.UseSwagger();
//    app.UseSwaggerUI();
//}

//CORS must run early so browsers can complete preflight before auth
app.UseCors("AllowReact");
app.UseHttpsRedirection();
app.UseAuthorization();

/* ---------------------------
   Endpoints
   --------------------------- */
app.MapHub<ChatHub>("/hubs/chat");
app.MapControllers();
app.Run();
