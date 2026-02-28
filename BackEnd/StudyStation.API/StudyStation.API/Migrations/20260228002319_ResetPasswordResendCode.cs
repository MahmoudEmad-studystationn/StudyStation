using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyStation.API.Migrations
{
    /// <inheritdoc />
    public partial class ResetPasswordResendCode : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OtpCode",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PasswordResetCodeExpiry",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "PasswordResetCode",
                table: "AspNetUsers",
                newName: "OtpCodeHash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OtpCodeHash",
                table: "AspNetUsers",
                newName: "PasswordResetCode");

            migrationBuilder.AddColumn<string>(
                name: "OtpCode",
                table: "AspNetUsers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "PasswordResetCodeExpiry",
                table: "AspNetUsers",
                type: "datetime2",
                nullable: true);
        }
    }
}
