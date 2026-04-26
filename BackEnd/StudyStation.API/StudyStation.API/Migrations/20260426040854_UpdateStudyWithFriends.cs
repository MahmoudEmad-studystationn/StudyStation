using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyStation.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateStudyWithFriends : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FocusSessions_StudyRooms_RoomId",
                table: "FocusSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomMessages_StudyRooms_RoomId",
                table: "RoomMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomParticipants_StudyRooms_RoomId",
                table: "RoomParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_StudyTasks_StudyRooms_RoomId",
                table: "StudyTasks");

            migrationBuilder.CreateIndex(
                name: "IX_StudyRooms_RoomCode",
                table: "StudyRooms",
                column: "RoomCode",
                unique: true,
                filter: "[RoomCode] IS NOT NULL");

            migrationBuilder.AddForeignKey(
                name: "FK_FocusSessions_StudyRooms_RoomId",
                table: "FocusSessions",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomMessages_StudyRooms_RoomId",
                table: "RoomMessages",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomParticipants_StudyRooms_RoomId",
                table: "RoomParticipants",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StudyTasks_StudyRooms_RoomId",
                table: "StudyTasks",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FocusSessions_StudyRooms_RoomId",
                table: "FocusSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomMessages_StudyRooms_RoomId",
                table: "RoomMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_RoomParticipants_StudyRooms_RoomId",
                table: "RoomParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_StudyTasks_StudyRooms_RoomId",
                table: "StudyTasks");

            migrationBuilder.DropIndex(
                name: "IX_StudyRooms_RoomCode",
                table: "StudyRooms");

            migrationBuilder.AddForeignKey(
                name: "FK_FocusSessions_StudyRooms_RoomId",
                table: "FocusSessions",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomMessages_StudyRooms_RoomId",
                table: "RoomMessages",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_RoomParticipants_StudyRooms_RoomId",
                table: "RoomParticipants",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_StudyTasks_StudyRooms_RoomId",
                table: "StudyTasks",
                column: "RoomId",
                principalTable: "StudyRooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
