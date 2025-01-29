using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeQuestApi_New.Migrations
{
    /// <inheritdoc />
    public partial class sqlitelocal_migration_501 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "ImgUrl",
                table: "Feylings",
                newName: "Img");

            migrationBuilder.AddColumn<string>(
                name: "Img",
                table: "Types",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Img",
                table: "Abilities",
                type: "TEXT",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Img",
                table: "Types");

            migrationBuilder.DropColumn(
                name: "Img",
                table: "Abilities");

            migrationBuilder.RenameColumn(
                name: "Img",
                table: "Feylings",
                newName: "ImgUrl");
        }
    }
}
