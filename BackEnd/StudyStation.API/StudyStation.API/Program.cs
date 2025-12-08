using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
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
            .WithOrigins("http://localhost:5173", "http://localhost:5174", "https://study-station.runasp.net")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// 2. تسجيل الـ Controllers و SignalR
builder.Services.AddControllers();
builder.Services.AddSignalR();

// 3. تسجيل Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
// استبدل هذا السطر: builder.Services.AddSwaggerGen();
// بهذا الكود الكامل:
builder.Services.AddSwaggerGen(options =>
{
    // 1. تعريف مخطط الأمان (Security Scheme)
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 12345abcdef\""
    });

    // 2. إضافة متطلبات الأمان (Security Requirement)
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});


// 4. إعداد قاعدة البيانات و DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<DatabaseContext>(options =>
    options.UseSqlServer(connectionString, sqlServerOptions =>
    {
        sqlServerOptions.EnableRetryOnFailure(
            maxRetryCount: 5, // سيحاول 5 مرات كحد أقصى
            maxRetryDelay: TimeSpan.FromSeconds(30), // أقصى مدة انتظار بين المحاولات
            errorNumbersToAdd: null); // استخدم الأخطاء الافتراضية التي يعرفها EF Core
    }));
// 5. إعداد نظام الهوية (Identity)
builder.Services.AddIdentity<ApplicationUser, IdentityRole<int>>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = false; // تم التغيير لتسهيل الاختبار
    options.User.RequireUniqueEmail = true;
    options.SignIn.RequireConfirmedEmail = true; // تفعيل تأكيد البريد الإلكتروني
})
.AddEntityFrameworkStores<DatabaseContext>()
.AddDefaultTokenProviders(); // مهم لإنشاء رموز OTP وتغيير كلمة المرور

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
// يمكنك إضافة إعدادات البريد الإلكتروني هنا لاحقاً باستخدام user-secrets

// 8. تسجيل MediatR و FluentValidation
// سيقوم MediatR بالبحث عن كل الـ Handlers في المشروع
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
// سيقوم FluentValidation بالبحث عن كل الـ Validators
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{

    app.UseDeveloperExceptionPage();
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowFrontend");

// المصادقة أولاً ثم الصلاحيات
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<NotificationHub>("/Hubs/NotificationHub");

app.Run();
