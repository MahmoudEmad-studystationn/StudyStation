using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyStation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddOnlinePresenceTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsOnline",
                table: "RoomParticipants",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastActiveAt",
                table: "RoomParticipants",
                type: "datetime2",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsOnline",
                table: "RoomParticipants");

            migrationBuilder.DropColumn(
                name: "LastActiveAt",
                table: "RoomParticipants");
        }
    }
}
