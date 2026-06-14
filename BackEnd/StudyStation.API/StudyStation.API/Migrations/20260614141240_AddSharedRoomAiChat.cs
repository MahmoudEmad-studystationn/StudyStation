using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyStation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSharedRoomAiChat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SenderName",
                table: "AiMessages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SenderUserId",
                table: "AiMessages",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "AiConversations",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "RoomId",
                table: "AiConversations",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AiConversations_RoomId",
                table: "AiConversations",
                column: "RoomId");

            migrationBuilder.AddForeignKey(
                name: "FK_AiConversations_StudyRooms_RoomId",
                table: "AiConversations",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AiConversations_StudyRooms_RoomId",
                table: "AiConversations");

            migrationBuilder.DropIndex(
                name: "IX_AiConversations_RoomId",
                table: "AiConversations");

            migrationBuilder.DropColumn(
                name: "SenderName",
                table: "AiMessages");

            migrationBuilder.DropColumn(
                name: "SenderUserId",
                table: "AiMessages");

            migrationBuilder.DropColumn(
                name: "RoomId",
                table: "AiConversations");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "AiConversations",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
