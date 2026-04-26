using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using StudyStation.API.Data;
using StudyStation.API.Hubs;
using StudyStation.API.Models;
using StudyStation.API.Services;
using System.Text;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpContextAccessor();


// 1. إعدادات CORS للسماح للواجهة الأمامية بالاتصال
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            // .AllowAnyOrigin()
            .WithOrigins("http://localhost:5173", "http://localhost:5174", "https://study-station.runasp.net", "https://study-station-alpha.vercel.app", "https://study-station-51en40xbc-mariams-projects-2d4c7ff0.vercel.app/", "https://localhost:7152")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 2. تسجيل الـ Controllers و SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// 3. تسجيل OpenAPI مع Scalar
// ✏️ تم الحذف: builder.Services.AddEndpointsApiExplorer() - مش محتاجها مع Scalar
// ✏️ تم الحذف: builder.Services.AddSwaggerGen() والكود الكامل بتاعه
// ✏️ تم الاستبدال بـ: AddOpenApi() البسيطة - Scalar بتتعامل مع JWT تلقائياً من الـ middleware
builder.Services.AddOpenApi();

// 4. إعداد قاعدة البيانات و DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DatabaseContext>(options =>
    options.UseSqlServer(connectionString, sqlServerOptions =>
    {
        sqlServerOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null);
    }));

// 5. إعداد نظام الهوية (Identity)
builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false;
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true;
})
.AddEntityFrameworkStores<DatabaseContext>()
.AddDefaultTokenProviders();

// 6. إعداد مصادقة JWT
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured.");
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

// 7. تسجيل الخدمات المشتركة
builder.Services.AddScoped<JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// 8. تسجيل MediatR و FluentValidation
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();

    // ✏️ تم الحذف: app.UseSwagger() و app.UseSwaggerUI()
    // ✏️ تم الاستبدال بـ: MapOpenApi و MapScalarApiReference
    // الـ Scalar UI هتبقى متاحة على: /scalar/v1
    
}
app.MapOpenApi();
app.MapScalarApiReference();

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowFrontend");

// المصادقة أولاً ثم الصلاحيات
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/Hubs/NotificationHub");
app.MapHub<StudyStation.API.Hubs.StudyHub>("/Hubs/StudyHub");
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        await StudyStation.API.Features.Admin.Seeders.AdminSeeder.SeedAdminAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding the admin account.");
    }
}

app.Run();