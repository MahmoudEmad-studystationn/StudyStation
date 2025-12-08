using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudyStation.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryAndTypeToLibraryResource : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoryId",
                table: "LibraryResources",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ResourceTypeId",
                table: "LibraryResources",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "LibraryCategories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LibraryCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ResourceTypes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourceTypes", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_LibraryResources_CategoryId",
                table: "LibraryResources",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_LibraryResources_ResourceTypeId",
                table: "LibraryResources",
                column: "ResourceTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_LibraryResources_LibraryCategories_CategoryId",
                table: "LibraryResources",
                column: "CategoryId",
                principalTable: "LibraryCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_LibraryResources_ResourceTypes_ResourceTypeId",
                table: "LibraryResources",
                column: "ResourceTypeId",
                principalTable: "ResourceTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_LibraryResources_LibraryCategories_CategoryId",
                table: "LibraryResources");

            migrationBuilder.DropForeignKey(
                name: "FK_LibraryResources_ResourceTypes_ResourceTypeId",
                table: "LibraryResources");

            migrationBuilder.DropTable(
                name: "LibraryCategories");

            migrationBuilder.DropTable(
                name: "ResourceTypes");

            migrationBuilder.DropIndex(
                name: "IX_LibraryResources_CategoryId",
                table: "LibraryResources");

            migrationBuilder.DropIndex(
                name: "IX_LibraryResources_ResourceTypeId",
                table: "LibraryResources");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "LibraryResources");

            migrationBuilder.DropColumn(
                name: "ResourceTypeId",
                table: "LibraryResources");
        }
    }
}
