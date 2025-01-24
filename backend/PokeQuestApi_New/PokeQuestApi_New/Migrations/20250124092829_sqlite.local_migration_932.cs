using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeQuestApi_New.Migrations
{
    /// <inheritdoc />
    public partial class sqlitelocal_migration_932 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserRole",
                table: "AspNetUsers");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserRole",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }
    }
}
