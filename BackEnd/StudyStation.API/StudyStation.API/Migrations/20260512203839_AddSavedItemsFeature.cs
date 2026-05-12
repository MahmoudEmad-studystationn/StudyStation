using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyStation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddSavedItemsFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SavedItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ItemType = table.Column<int>(type: "int", nullable: false),
                    PostId = table.Column<int>(type: "int", nullable: true),
                    LibraryResourceId = table.Column<int>(type: "int", nullable: true),
                    SavedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SavedItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SavedItems_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SavedItems_LibraryResources_LibraryResourceId",
                        column: x => x.LibraryResourceId,
                        principalTable: "LibraryResources",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SavedItems_Posts_PostId",
                        column: x => x.PostId,
                        principalTable: "Posts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SavedItems_LibraryResourceId",
                table: "SavedItems",
                column: "LibraryResourceId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedItems_PostId",
                table: "SavedItems",
                column: "PostId");

            migrationBuilder.CreateIndex(
                name: "IX_SavedItems_UserId",
                table: "SavedItems",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SavedItems");
        }
    }
}
